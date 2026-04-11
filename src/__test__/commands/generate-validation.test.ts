import generateValidation from "../../commands/generate-validation";
import path from "node:path";
import { execSync } from "child_process";
import { log } from "../../helper";
import { mkdir, writeFile } from "node:fs/promises";

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

jest.mock("node:fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const promptMock = prompts.select as jest.Mock;

describe("generateValidation", () => {
  const cwdMock = "/mock-root";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "cwd").mockReturnValue(cwdMock);
  });

  // ✅ Error case
  test("should log error if name is missing", async () => {
    await generateValidation("", "commonjs");

    expect(log.error).toHaveBeenCalledWith("Module name is required");
    expect(mkdir).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
  });

  // ✅ CommonJS case
  test("should generate validation file for commonjs", async () => {
    promptMock.mockResolvedValue("commonjs");

    await generateValidation("user", "commonjs");

    const dir = path.join(cwdMock, "src/validation", "user");

    expect(mkdir).toHaveBeenCalledWith(dir, { recursive: true });
    expect(log.success).toHaveBeenCalledWith(
      "Validation for user created successfully!",
    );
  });

  // ✅ ES Module case
  test("should generate validation file for ES module", async () => {
    promptMock.mockResolvedValue("module");

    await generateValidation("product", "module");
  });

  // ✅ content includes schema usage
  test("should include schema parsing in validation file", async () => {
    promptMock.mockResolvedValue("commonjs");

    await generateValidation("order", "commonjs");

    const content = (writeFile as any).mock.calls[0][1];
    expect(content).toContain("orderSchema.safeParse");
  });
});
