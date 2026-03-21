import crud from "../../generators/crud";
import fs from "fs-extra";
import inquirer from "inquirer";
import { log } from "../../helper/chalk";

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));
jest.mock("cli-table3", () => ({
  Table: jest.fn(),
}));
jest.mock("../../helper/showTablePreview", () => ({
  showTablePreview: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  writeFile: jest.fn(),
  readdir: jest.fn().mockResolvedValue(["index.routes.js"]),
}));
jest.mock("../../helper/addField", () => ({
  addField: jest.fn(),
}));
jest.mock("../../helper/editField", () => ({
  editField: jest.fn(),
}));
jest.mock("../../helper/parseFields", () => ({
  parseFields: jest.fn().mockResolvedValue(["name:string"]),
}));
jest.mock("../../helper/deleteField", () => ({
  deleteField: jest.fn(),
}));
jest.mock("../../helper/enhanceFields", () => ({
  enhanceFields: jest.fn(),
}));
jest.mock("../../helper/getTypeColor", () => ({
  getTypeColor: jest.fn(),
}));
jest.mock("../../helper/showTablePreview", () => ({
  showTablePreview: jest.fn(),
}));

jest.mock("../../helper/chalk", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
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
      fieldInput: "name:string, email:string",
      action: "continue",
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
      fieldInput: "name:string, email:string",
      action: "continue",
    });

    await crud("/base", "product");

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should handle fastify commonjs", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "commonjs",
      fieldInput: "name:string, email:string",
      action: "continue",
    });

    await crud("/base", "product");

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should handle express module with module type", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "module",
      fieldInput: "name:string, email:string",
      action: "continue",
    });

    await crud("/base", "product");

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should log error when module name missing", async () => {
    await crud("/base", "");

    expect(log.error).toHaveBeenCalledWith("Module name is required");
  });

  test("should evaluate when conditions", async () => {
    let firstCallQuestions: any[] = [];

    promptMock.mockImplementation(async (q: any) => {
      // capture only first call (array of questions)
      if (Array.isArray(q) && firstCallQuestions.length === 0) {
        firstCallQuestions = q;
      }

      return {
        framework: "express",
        moduleType: "commonjs",
        fieldInput: "name:string,email:string",
        action: "cancel",
      };
    });

    await crud("/base", "user");

    expect(firstCallQuestions.length).toBeGreaterThan(0);

    const frameworkWhen = firstCallQuestions[0].when;
    const moduleTypeWhen = firstCallQuestions[1].when;

    expect(frameworkWhen()).toBe(true);
    expect(moduleTypeWhen()).toBe(true);
  });
});
