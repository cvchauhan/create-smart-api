import generateCrud from "../../commands/generate-crud";
import { log } from "../../helper/chalk";
import crud from "../../generators/crud";

// ✅ mock dependencies
jest.mock("../../helper/chalk", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
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
jest.mock("../../helper/relations", () => ({
  askRelations: jest.fn(),
}));

jest.mock("../../generators/crud", () => jest.fn());

describe("generate crud command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when module name is missing", async () => {
    await generateCrud();

    expect(log.error).toHaveBeenCalledWith("Module name is required");
    expect(crud).not.toHaveBeenCalled();
  });

  test("should call crud generator when module name provided", async () => {
    await generateCrud("user", "express", "commonjs");

    expect(crud).toHaveBeenCalledWith(
      process.cwd(),
      "user",
      "express",
      "commonjs",
      undefined,
    );
  });
});
