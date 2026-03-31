import crud from "../../generators/crud";
import { prompt } from "../../helper/promptAdapter";
import { log } from "../../helper";
import generateModel from "../../commands/model";
import { writeFile } from "fs/promises";

jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

jest.mock("picocolors", () => ({
  pc: jest.fn(),
  cyan: jest.fn(),
  bold: jest.fn(),
}));
jest.mock("../../utils/field.util", () => ({
  askFieldDetails: jest.fn(),
  addField: jest.fn(),
}));
jest.mock("../../utils/model.util", () => ({
  generateSequelizeModel: jest.fn(),
  generateMongooseModel: jest.fn(),
  generateSequelizeRelations: jest.fn(),
}));
jest.mock("../../helper/showTablePreview", () => ({
  showTablePreview: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  writeFile: jest.fn(),
}));
jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  lstatSync: jest.fn().mockReturnValue({ isDirectory: () => true }),
  readdirSync: jest.fn().mockReturnValue(["index.routes.js"]),
  readFileSync: jest
    .fn()
    .mockReturnValue(JSON.stringify({ createSmartApi: {} })),
}));
jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const promptMock = prompt as any;

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

    expect(writeFile).toHaveBeenCalled();
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

    await generateModel("", "module", "mongodb", true);

    expect(writeFile).toHaveBeenCalled();
  });

  test("should handle fastify commonjs", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "commonjs",
      fieldInput: "name:string, email:string",
      action: "continue",
    });

    await crud("/base", "product");

    expect(writeFile).toHaveBeenCalled();
  });

  test("should handle express module with module type", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "module",
      fieldInput: "name:string, email:string",
      action: "continue",
    });

    await crud("/base", "product");
    await generateModel("product", "module", "mongodb", true);

    expect(writeFile).toHaveBeenCalled();
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
    const dbWhen = firstCallQuestions[2].when;

    expect(frameworkWhen()).toBe(true);
    expect(moduleTypeWhen()).toBe(true);
    expect(dbWhen()).toBe(true);
  });
});
