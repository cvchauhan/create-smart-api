import generateTest from "../../commands/generate-test"; // update path
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { execSync } from "child_process";
import { log } from "../../helper/chalk";

jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

jest.mock("fs-extra", () => ({
  mkdirp: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(),
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

jest.mock("../../helper/chalk", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const promptMock = inquirer.prompt as any;

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
    expect(execSync).not.toHaveBeenCalled();
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

    // execSync calls
    expect(execSync).toHaveBeenCalledWith(
      "npm install jest supertest --save-dev",
      expect.any(Object),
    );

    expect(execSync).toHaveBeenCalledWith(
      'npm pkg set scripts.test="jest"',
      expect.any(Object),
    );

    // directory creation
    expect(fs.mkdirp).toHaveBeenCalledWith(testDir);

    // file creation
    expect(fs.writeFile).toHaveBeenCalledWith(
      testFile,
      expect.stringContaining('require("supertest")'),
    );

    expect(fs.writeFile).toHaveBeenCalledWith(
      jestConfigFile,
      expect.stringContaining("module.exports"),
    );

    expect(log.success).toHaveBeenCalledWith(
      "Jest test generated successfully",
    );
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

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(cwdMock, "jest.config.js"),
      expect.stringContaining("export default"),
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
