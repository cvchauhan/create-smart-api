import generateTest from "../../commands/generate-test";
import path from "path";
import { log } from "../../helper";
import { execSync } from "child_process";
import { mkdir, writeFile } from "fs/promises";

import * as prompts from "@clack/prompts";

jest.mock("@clack/prompts", () => ({
  text: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  isCancel: jest.fn(() => false),
  cancel: jest.fn(),
  intro: jest.fn(),
  outro: jest.fn(),
}));

const selectMock = prompts.select as jest.Mock;

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));
jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue("{}"),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    step: jest.fn(),
  },
}));

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
    selectMock.mockResolvedValueOnce("commonjs");

    await generateTest("user", "commonjs");

    const testDir = path.join(cwdMock, "tests");
    const testFile = path.join(testDir, "user.test.js");
    const jestConfigFile = path.join(cwdMock, "jest.config.js");

    expect(execSyncMock).toHaveBeenCalledWith(
      'npm pkg set scripts.test="jest"',
      expect.any(Object),
    );

    // directory creation
    expect(mkdir).toHaveBeenCalledWith(testDir, { recursive: true });

    expect(log.success).toHaveBeenCalledWith(
      "Test file for user created successfully!",
    );
  });

  // ✅ ES Module case
  test("should generate test files for ES module", async () => {
    selectMock.mockResolvedValueOnce("module");

    await generateTest("product", "module");

    const testDir = path.join(cwdMock, "tests");
    const testFile = path.join(testDir, "product.test.js");

    expect(writeFile).toHaveBeenCalledWith(
      testFile,
      expect.stringContaining("import request"),
    );
  });

  // ✅ validate test content includes route
  test("should include correct route in test file", async () => {
    selectMock.mockResolvedValueOnce("commonjs");

    await generateTest("order", "commonjs");

    const content = (writeFile as any).mock.calls.find(
      ([file]: [string, string]) => file.includes("order.test.js"),
    )[1];

    expect(content).toContain("GET /order");
  });
});
