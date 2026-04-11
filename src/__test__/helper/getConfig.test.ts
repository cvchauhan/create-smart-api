import { existsSync, readFileSync } from "node:fs";
import { log } from "../../helper";
import { getConfig } from "../../helper/getConfig";

jest.mock("node:fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("../../helper/saveProjectConfig", () => ({
  saveProjectConfig: jest.fn().mockResolvedValue({
    db: "mongodb",
    framework: "express",
    module: "commonjs",
  }),
}));
const mockedExistsSync = require("node:fs").existsSync as jest.Mock;
const mockedReadFileSync = require("node:fs").readFileSync as jest.Mock;
describe("Getconfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when name is missing", async () => {
    await getConfig("");

    expect(log.error).toHaveBeenCalledWith("Not inside a valid project");
  });

  test("should return empty config when .smart-api.json is invalid", async () => {
    mockedExistsSync.mockReturnValueOnce(true);
    jest
      .spyOn(require("node:fs"), "readFileSync")
      .mockReturnValueOnce("invalid json");
    const config = await getConfig("/mock-root");
    expect(config).toEqual({});
  });

  test("should return empty config when package.json is invalid", async () => {
    mockedExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
    mockedReadFileSync.mockReturnValueOnce({
      type: "module",
      dependencies: { express: "^4.0.0", mongoose: "^5.0.0" },
    });
    const config = await getConfig("/mock-root");
    expect(config).toEqual({});
  });
});
