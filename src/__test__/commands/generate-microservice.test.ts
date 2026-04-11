import { log } from "../../helper";
import generateMicro from "../../commands/generate-microservice";
import { mkdir } from "node:fs/promises";

jest.mock("node:fs/promises", () => ({
  mkdir: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("generate microservice command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });

  test("should log error when name is missing", async () => {
    await generateMicro("");

    expect(log.error).toHaveBeenCalledWith("Microservice name is required");
    expect(mkdir).not.toHaveBeenCalled();
  });

  test("should create microservice folder structure", async () => {
    await generateMicro("test-micro");

    const base = `${process.cwd()}/test-micro`;

    expect(log.success).toHaveBeenCalledWith("Microservice structure created");
  });
});
