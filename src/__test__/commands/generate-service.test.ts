import generateService from "../../commands/generate-service";
import fs from "fs-extra";
import { prompt } from "../../helper/promptAdapter";
import path from "path";
import { log } from "../../helper";

// ✅ Mock helper prompt (NEW)
jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  writeFile: jest.fn(),
  readdir: jest.fn().mockResolvedValue(["index.routes.js"]),
  existsSync: jest.fn().mockReturnValue(true),
  lstatSync: jest.fn().mockReturnValue({ isDirectory: () => true }),
  readdirSync: jest.fn().mockReturnValue(["index.routes.js"]),
  readJSONSync: jest.fn().mockReturnValue({ createSmartApi: {} }),
  fs: jest.fn(),
  mkdirp: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("chalk", () => {
  const white: any = jest.fn(); // function
  white.bold = jest.fn(); // attach property

  return {
    bold: jest.fn(),
    cyan: jest.fn(),
    gray: jest.fn(),
    green: jest.fn(),
    red: jest.fn(),
    yellow: jest.fn(),
    white, // ✅ both work now
  };
});

const promptMock = prompt as any;

describe("generateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const cwdMock = "/mock-root";

  beforeEach(() => {
    jest.spyOn(process, "cwd").mockReturnValue(cwdMock);
  });

  // ✅ Error case
  test("should log error if name is missing", async () => {
    await generateService("", "commonjs");

    expect(log.error).toHaveBeenCalledWith("Service name is required");
    expect(fs.mkdirp).not.toHaveBeenCalled();
  });

  // ✅ CommonJS case
  test("should generate service in commonjs", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
      action: "continue",
    });

    await generateService("user", "commonjs");

    const dir = path.join(cwdMock, "src/services");

    expect(fs.mkdirp).toHaveBeenCalledWith(dir);

    const filePath = path.join(dir, "user.service.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("module.exports"),
    );

    expect(log.success).toHaveBeenCalledWith("Service created");
  });

  // ✅ ES Module case
  test("should generate service in ES module", async () => {
    promptMock.mockResolvedValue({
      moduleType: "module",
      action: "continue",
    });

    await generateService("product", "module");

    const dir = path.join(cwdMock, "src/services");

    const filePath = path.join(dir, "product.service.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("export const"),
    );
  });
});
