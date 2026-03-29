import create from "../../commands/create";
import { prompt } from "../../helper/promptAdapter";
import { execSync } from "child_process";
import { createStructure } from "../../generators/project";
import generateCrud from "../../generators/crud";
import { log } from "../../helper";
import { mkdir } from "fs/promises";

jest.spyOn(process, "chdir").mockImplementation(() => {});

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn().mockResolvedValue(JSON.stringify({ createSmartApi: {} })),
  readdir: jest.fn(),
  access: jest.fn(),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  lstatSync: jest.fn(() => ({
    isDirectory: jest.fn().mockReturnValue(true),
  })),
  readFileSync: jest
    .fn()
    .mockReturnValue(JSON.stringify({ createSmartApi: {} })),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("../../generators/project", () => ({
  createStructure: jest.fn(),
}));

jest.mock("../../generators/crud", () => jest.fn());

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const promptMock = prompt as any;

describe("create command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });

  test("should create project with express + mongodb + crud", async () => {
    promptMock.mockResolvedValue({
      name: "test-app",
      framework: "express",
      moduleType: "commonjs",
      db: "mongodb",
      crud: true,
      moduleName: "user",
      port: 3000,
    });

    await create("");

    expect(mkdir).toHaveBeenCalled();
    expect(createStructure).toHaveBeenCalled();

    expect(execSync).toHaveBeenCalledWith("npm init -y", expect.any(Object));
    expect(execSync).toHaveBeenCalledWith(
      "npm install express",
      expect.any(Object),
    );
    expect(execSync).toHaveBeenCalledWith(
      "npm install mongoose",
      expect.any(Object),
    );

    expect(generateCrud).toHaveBeenCalledWith(
      expect.any(String),
      "user",
      "express",
      "commonjs",
      "mongodb",
      true,
    );

    expect(log.success).toHaveBeenCalled();
  });

  test("should skip CRUD when disabled", async () => {
    promptMock.mockResolvedValue({
      name: "test-app",
      framework: "fastify",
      moduleType: "module",
      db: "mysql",
      crud: false,
      moduleName: "user",
      port: 4000,
    });

    await create("");

    expect(execSync).toHaveBeenCalledWith(
      "npm install fastify",
      expect.any(Object),
    );

    expect(execSync).toHaveBeenCalledWith(
      "npm install mysql2 sequelize",
      expect.any(Object),
    );

    expect(generateCrud).not.toHaveBeenCalled();
  });

  test("should set module type when module selected", async () => {
    promptMock.mockResolvedValue({
      name: "test-app",
      framework: "express",
      moduleType: "module",
      db: "mongodb",
      crud: false,
      moduleName: "user",
      port: 3000,
    });

    await create("");

    expect(execSync).toHaveBeenCalledWith(
      "npm pkg set type=module",
      expect.any(Object),
    );
  });

  test("should use provided name (skip prompt condition)", async () => {
    let questions: any[] = [];

    promptMock.mockImplementation(async (q: any) => {
      if (Array.isArray(q) && questions.length === 0) {
        questions = q;
      }

      return {
        framework: "express",
        moduleType: "commonjs",
        db: "mssql",
        crud: false,
        moduleName: "user",
        port: 3000,
      };
    });

    await create("my-app");

    expect(questions.length).toBeGreaterThan(0);

    const nameQuestion = questions.find((q: any) => q.name === "name");

    expect(nameQuestion).toBeDefined();
    expect(typeof nameQuestion.when).toBe("function");

    expect(nameQuestion.when()).toBe(false);
  });

  test("should show moduleName when crud is true", async () => {
    let questions: any[] = [];
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return {
        crud: true,
      };
    });

    await create("");

    const moduleNameWhen = questions.find(
      (q: any) => q.name === "moduleName",
    ).when;

    expect(moduleNameWhen({ crud: true })).toBe(true); // ✅ covered
  });
});
