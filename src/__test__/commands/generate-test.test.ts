import generateTest from "../../commands/generate-test";
import { prompt } from "../../helper/promptAdapter";
import path from "path";
import fs from "fs-extra";
import { log } from "../../helper";
import { execSync } from "child_process";

// ✅ Mock helper prompt (NEW)
jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  mkdirp: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  readJSONSync: jest.fn().mockReturnValue({ createSmartApi: {} }),
  readFileSync: jest.fn().mockReturnValue("{}"),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const promptMock = prompt as any;
const execSyncMock = execSync as any;

describe("generateTest command", () => {
  const cwdMock = "/mock-root";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "cwd").mockReturnValue(cwdMock);
  });

  // ✅ Error case
  test("should log error if module name is missing", async () => {
    await generateTest("", "commonjs");

    expect(log.error).toHaveBeenCalledWith("Module name is required");
    expect(execSyncMock).not.toHaveBeenCalled();
  });

  // ✅ CommonJS case
  test("should generate test files for commonjs", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateTest("user", "commonjs");

    const testDir = path.join(cwdMock, "tests");
    const testFile = path.join(testDir, "user.test.js");
    const jestConfigFile = path.join(cwdMock, "jest.config.js");

    expect(execSyncMock).toHaveBeenCalledWith(
      'npm pkg set scripts.test="jest"',
      expect.any(Object),
    );

    // directory creation
    expect(fs.mkdirp).toHaveBeenCalledWith(testDir);

    expect(log.success).toHaveBeenCalledWith("Test generated successfully");
  });

  // ✅ ES Module case
  test("should generate test files for ES module", async () => {
    promptMock.mockResolvedValue({
      moduleType: "module",
    });

    await generateTest("product", "module");

    const testDir = path.join(cwdMock, "tests");
    const testFile = path.join(testDir, "product.test.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      testFile,
      expect.stringContaining("import request"),
    );
  });

  // ✅ when condition TRUE
  let questions: any[];
  test("should evaluate when condition true", async () => {
    promptMock.mockImplementation(async (q: any[]) => {
      questions = q;
      return { moduleType: "commonjs" };
    });

    await generateTest("user", undefined as any);

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(true);
  });

  // ✅ when condition FALSE
  test("should evaluate when condition false", async () => {
    promptMock.mockImplementation(async (q: any[]) => {
      questions = q;
      return {};
    });

    await generateTest("user", "commonjs");

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(false);
  });

  // ✅ validate test content includes route
  test("should include correct route in test file", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateTest("order", "commonjs");

    const content = (fs.writeFile as any).mock.calls.find(
      ([file]: [string, string]) => file.includes("order.test.js"),
    )[1];

    expect(content).toContain("GET /order");
  });
});
