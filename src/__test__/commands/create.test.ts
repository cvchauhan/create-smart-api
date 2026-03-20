import create from "../../commands/create";
import inquirer from "inquirer";
import fs, { writeFile } from "fs-extra";
import { execSync } from "child_process";
import { createStructure } from "../../generators/project";
import generateCrud from "../../generators/crud";
import { log } from "../../helper/chalk";
jest.spyOn(process, "chdir").mockImplementation(() => {});

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  mkdirp: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("../../generators/project", () => ({
  createStructure: jest.fn(),
}));

jest.mock("../../generators/crud", () => jest.fn());

jest.mock("../../helper/chalk", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const promptMock = inquirer.prompt as any;

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

    expect(fs.mkdirp).toHaveBeenCalled();
    expect(createStructure).toHaveBeenCalled();

    expect(execSync).toHaveBeenCalledWith("npm init -y", expect.any(Object));
    expect(execSync).toHaveBeenCalledWith(
      "npm install express dotenv",
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
      "npm install fastify dotenv",
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

  let questions: any[];
  test("should use provided name (skip prompt condition)", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
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

    const nameWhen = questions[0].when;

    expect(nameWhen()).toBe(false); // coverage for when
  });
  test("should show moduleName when crud is true", async () => {
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
