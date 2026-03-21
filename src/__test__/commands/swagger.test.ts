import generateSwagger from "../../commands/swagger";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { log } from "../../helper/chalk";

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));
jest.mock("../../helper/generateDbConfig", () => ({
  generateDbConfig: jest.fn(),
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
jest.mock("../../helper/generateMongooseModel", () => ({
  generateMongooseModel: jest.fn(),
}));
jest.mock("../../helper/generateSequelizeModel", () => ({
  generateSequelizeModel: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  ensureDir: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("../../helper/chalk", () => ({
  log: {
    success: jest.fn(),
  },
}));

const promptMock = inquirer.prompt as any;

describe("generateSwagger", () => {
  const base = "/";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "cwd").mockReturnValue(base);
  });

  // ✅ CommonJS case
  test("should generate swagger with commonjs", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateSwagger();
    const swaggerPath = path.join(base, "src/config", "swagger.js");

    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(base, "src/config"));

    expect(fs.writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining('require("swagger-jsdoc")'),
    );

    expect(log.success).toHaveBeenCalledWith("Swagger configuration created");
  });

  // ✅ ESM case
  test("should generate swagger with ES module", async () => {
    promptMock.mockResolvedValue({
      moduleType: "module",
    });

    await generateSwagger();

    const swaggerPath = path.join(base, "src/config", "swagger.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining("import swaggerJsdoc"),
    );

    expect(fs.writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining("export const swaggerDocs"),
    );
  });

  // ✅ ensureDir called
  test("should create config directory", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateSwagger();

    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(base, "src/config"));
  });

  // ✅ when condition TRUE (moduleType not provided)
  let questions: any[];
  test("should evaluate when condition true", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return { moduleType: "commonjs" };
    });

    await generateSwagger();

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(true);
  });

  // ✅ when condition FALSE (moduleType provided)
  test("should evaluate when condition false when moduleType passed", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return {};
    });

    await generateSwagger("commonjs");

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(false);
  });

  // ✅ validate full content (optional strong test)
  test("should include swagger setup route", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateSwagger();

    const content = (fs.writeFile as any).mock.calls[0][1];

    expect(content).toContain("/api-docs");
    expect(content).toContain("swaggerUi.setup");
  });
});
