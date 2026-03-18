import crud from "../../generators/crud";
import fs from "fs-extra";
import inquirer from "inquirer";
import { log } from "../../helper/chalk";

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  writeFile: jest.fn(),
  readdir: jest.fn().mockResolvedValue(["index.routes.js"]),
}));

jest.mock("../../helper/chalk", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const promptMock = inquirer.prompt as any;

describe("crud generator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create CRUD files for express commonjs", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "commonjs",
    });

    await crud("/base", "user");

    expect(fs.writeFile).toHaveBeenCalled();
    expect(log.success).toHaveBeenCalledWith(
      "CRUD for user created successfully",
    );
  });

  test("should handle fastify module", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "module",
    });

    await crud("/base", "product");

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should handle fastify commonjs", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "commonjs",
    });

    await crud("/base", "product");

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should handle express module with module type", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "module",
    });

    await crud("/base", "product");

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should log error when module name missing", async () => {
    await crud("/base", "");

    expect(log.error).toHaveBeenCalledWith("Module name is required");
  });

  let questions: any[];
  test("should evaluate when conditions", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return {
        framework: "express",
        moduleType: "commonjs",
      };
    });

    await crud("/base", "user");

    const frameworkWhen = questions[0].when;
    const moduleTypeWhen = questions[1].when;

    expect(frameworkWhen()).toBe(true);
    expect(moduleTypeWhen()).toBe(true);
  });
});
