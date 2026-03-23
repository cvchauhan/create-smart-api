import generateService from "../../commands/generate-service";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { log } from "../../helper";

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  fs: jest.fn(),
  mkdirp: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  readJSONSync: jest.fn().mockReturnValue({ createSmartApi: {} }),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const promptMock = inquirer.prompt as any;

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
    });

    await generateService("product", "module");

    const dir = path.join(cwdMock, "src/services");

    const filePath = path.join(dir, "product.service.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("export const"),
    );
  });

  // ✅ when condition TRUE
  let questions: any[];
  test("should evaluate when condition true", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return { moduleType: "commonjs" };
    });

    await generateService("user", undefined as any);

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(true);
  });

  // ✅ when condition FALSE
  test("should evaluate when condition false", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return {};
    });

    await generateService("user", "commonjs");

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(false);
  });

  // ✅ validate content structure
  test("should include getAll and create functions", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateService("order", "commonjs");

    const content = (fs.writeFile as any).mock.calls[0][1];

    expect(content).toContain("getAll");
    expect(content).toContain("create");
  });
});
