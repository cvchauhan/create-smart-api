import { log } from "../../helper/chalk";
import generateMicro from "../../commands/generate-microservice";
import { mkdirp } from "fs-extra";

jest.mock("fs-extra", () => ({
  mkdirp: jest.fn(),
}));

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

describe("generate microservice command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });

  test("should log error when name is missing", async () => {
    await generateMicro("");

    expect(log.error).toHaveBeenCalledWith("Microservice name is required");
    expect(mkdirp).not.toHaveBeenCalled();
  });

  test("should create microservice folder structure", async () => {
    await generateMicro("test-micro");

    const base = `${process.cwd()}/test-micro`;

    expect(log.success).toHaveBeenCalledWith("Microservice structure created");
  });
});
