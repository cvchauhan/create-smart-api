import generateCrud from "../../commands/generate-crud";
import { log } from "../../helper";
import crud from "../../generators/crud";

// ✅ mock dependencies
jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../../generators/crud", () => jest.fn());

describe("generate crud command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when module name is missing", async () => {
    await generateCrud("");

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
