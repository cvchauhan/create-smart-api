import generateValidation from "../../commands/generate-validation";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { execSync } from "child_process";
import { log } from "../../helper";

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  mkdirp: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  readJSONSync: jest.fn().mockReturnValue({ createSmartApi: {} }),
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

const promptMock = inquirer.prompt as any;

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
    expect(fs.mkdirp).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
  });

  // ✅ CommonJS case
  test("should generate validation file for commonjs", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateValidation("user", "commonjs");

    const dir = path.join(cwdMock, "src/validation", "user");
    const filePath = path.join(dir, "user.validation.js");

    expect(execSync).toHaveBeenCalledWith("npm install zod", {
      stdio: "inherit",
    });
    expect(fs.mkdirp).toHaveBeenCalledWith(dir);
    expect(fs.writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("module.exports"),
    );
    expect(log.success).toHaveBeenCalledWith("Validation created");
  });

  // ✅ ES Module case
  test("should generate validation file for ES module", async () => {
    promptMock.mockResolvedValue({
      moduleType: "module",
    });

    await generateValidation("product", "module");

    const dir = path.join(cwdMock, "src/validation", "product");
    const filePath = path.join(dir, "product.validation.js");

    expect(fs.writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("export default function"),
    );
  });

  // ✅ when condition TRUE
  let questions: any[];
  test("should evaluate when condition true", async () => {
    promptMock.mockImplementation(async (q: any[]) => {
      questions = q;
      return { moduleType: "commonjs" };
    });

    await generateValidation("order", undefined as any);

    const whenFn = questions[0].when;
    expect(whenFn()).toBe(true);
  });

  // ✅ when condition FALSE
  test("should evaluate when condition false", async () => {
    promptMock.mockImplementation(async (q: any[]) => {
      questions = q;
      return {};
    });

    await generateValidation("order", "commonjs");

    const whenFn = questions[0].when;
    expect(whenFn()).toBe(false);
  });

  // ✅ content includes schema usage
  test("should include schema parsing in validation file", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateValidation("order", "commonjs");

    const content = (fs.writeFile as any).mock.calls[0][1];
    expect(content).toContain("orderSchema.safeParse");
  });
});
