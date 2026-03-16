import { jest } from "@jest/globals";

const mkdirpMock = jest.fn();
const writeFileMock = jest.fn();
const execSyncMock = jest.fn();
const promptMock = jest.fn();

await jest.unstable_mockModule("fs-extra", () => ({
  default: {
    mkdirp: mkdirpMock,
    writeFile: writeFileMock,
  },
}));

await jest.unstable_mockModule("child_process", () => ({
  execSync: execSyncMock,
}));

await jest.unstable_mockModule("inquirer", () => ({
  default: {
    prompt: promptMock,
  },
}));

await jest.unstable_mockModule("../../helper/chalk.js", () => ({
  log: {
    success: jest.fn(),
  },
}));

const { default: generateAuth } =
  await import("../../commands/generate-auth.js");
const { log } = await import("../../helper/chalk.js");

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

    const frameworkQuestion = questions.find((q) => q.name === "framework");

    expect(frameworkQuestion.when()).toBe(false);
  });
  test("should skip framework prompt if framework passed", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "commonjs",
    });

    await generateAuth("fastify", "commonjs");

    const questions = promptMock.mock.calls[0][0];

    const frameworkQuestion = questions.find((q) => q.name === "framework");

    expect(frameworkQuestion.when()).toBe(false);
  });
});
