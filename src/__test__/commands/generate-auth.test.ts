import generateAuth from "../../commands/generate-auth";
import { log } from "../../helper";
import { execSync } from "child_process";
import { mkdir, writeFile } from "fs/promises";
import * as prompts from "@clack/prompts";

jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    step: jest.fn(),
    successBox: jest.fn(),
  },
}));
jest.mock("../../helper/runner", () => ({
  run: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

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

describe("Auth middleware generator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should generate express commonjs middleware", async () => {
    selectMock
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs");

    await generateAuth();

    expect(mkdir).toHaveBeenCalled();

    expect(execSync).toHaveBeenCalledWith("npm install jsonwebtoken bcrypt", {
      stdio: "inherit",
    });

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("module.exports"),
    );

    expect(log.success).toHaveBeenCalledWith(
      "Auth module + middleware generated successfully!",
    );
  });

  test("should generate express ES module middleware", async () => {
    selectMock.mockResolvedValueOnce("express").mockResolvedValueOnce("module");

    await generateAuth();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("export default"),
    );
  });

  test("should generate fastify middleware", async () => {
    selectMock.mockResolvedValueOnce("fastify").mockResolvedValueOnce("module");

    await generateAuth();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("reply"),
    );
  });

  // test("should skip framework prompt if framework passed", async () => {
  //   selectMock
  //     .mockResolvedValueOnce("express")
  //     .mockResolvedValueOnce("commonjs");

  //   await generateAuth("express", "commonjs");

  //   const questions = promptMock.mock.calls[0][0];

  //   const frameworkQuestion = questions.find(
  //     (q: { name: string }) => q.name === "framework",
  //   );

  //   expect(frameworkQuestion.when()).toBe(false);
  // });

  // test("should skip framework prompt if framework passed (fastify)", async () => {
  //   promptMock.mockResolvedValue({
  //     framework: "fastify",
  //     moduleType: "commonjs",
  //   });

  //   await generateAuth("fastify", "commonjs");

  //   const questions = promptMock.mock.calls[0][0];

  //   const frameworkQuestion = questions.find(
  //     (q: { name: string }) => q.name === "framework",
  //   );

  //   expect(frameworkQuestion.when()).toBe(false);
  // });

  // let questions: any[];
  // test("should evaluate when conditions", async () => {
  //   promptMock.mockImplementation(async (q: any) => {
  //     questions = q;
  //     return {
  //       framework: "express",
  //       moduleType: "commonjs",
  //     };
  //   });

  //   await generateAuth();

  //   const frameworkWhen = questions[0].when;
  //   const moduleTypeWhen = questions[1].when;

  //   expect(frameworkWhen()).toBe(true);
  //   expect(moduleTypeWhen()).toBe(true);
  // });
});
