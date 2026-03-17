import { jest } from "@jest/globals";
import { mkdir as mkdirpMock, writeFile as writeFileMock } from "fs-extra";
import { execSync as execSyncMock } from "child_process";

const promptMock: any = jest.fn();

await jest.unstable_mockModule("inquirer", () => ({
  default: {
    prompt: promptMock,
  },
}));

import { log } from "../../src/helper/chalk";
import generateAuth from "../../src/commands/generate-auth";

describe("Auth middleware generator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should generate express commonjs middleware", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "commonjs",
    });

    await generateAuth();

    expect(mkdirpMock).toHaveBeenCalled();
    expect(execSyncMock).toHaveBeenCalledWith(
      "npm install jsonwebtoken bcrypt",
      { stdio: "inherit" },
    );

    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("module.exports"),
    );

    expect(log.success).toHaveBeenCalledWith(
      "Auth middleware generated successfully",
    );
  });

  test("should generate express ES module middleware", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "module",
    });

    await generateAuth();

    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("export default"),
    );
  });

  test("should generate fastify middleware", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "module",
    });

    await generateAuth();

    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("reply"),
    );
  });

  test("should skip framework prompt if framework passed", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "commonjs",
    });

    await generateAuth("express", "commonjs");

    const questions = promptMock.mock.calls[0][0];

    const frameworkQuestion = questions.find(
      (q: { name: string }) => q.name === "framework",
    );

    expect(frameworkQuestion.when()).toBe(false);
  });
  test("should skip framework prompt if framework passed", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "commonjs",
    });

    await generateAuth("fastify", "commonjs");

    const questions = promptMock.mock.calls[0][0];

    const frameworkQuestion = questions.find(
      (q: { name: string }) => q.name === "framework",
    );

    expect(frameworkQuestion.when()).toBe(false);
  });
});
