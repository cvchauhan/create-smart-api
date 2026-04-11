import generateAuth from "../../commands/generate-auth";
import { log } from "../../helper";
import { mkdir, writeFile } from "node:fs/promises";
import * as prompts from "@clack/prompts";
import { spawnSync } from "node:child_process";

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

jest.mock("child_process", () => ({
  spawnSync: jest.fn(),
}));

jest.mock("node:fs/promises", () => ({
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

jest.mock("../../helper/getConfig", () => ({
  getConfig: jest.fn(() => ({})),
}));

const selectMock = prompts.select as jest.Mock;
const mockedGetConfig = require("../../helper/getConfig")
  .getConfig as jest.Mock;

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
    expect(spawnSync).toHaveBeenCalledWith(
      "npm",
      ["install", "jsonwebtoken", "bcrypt"],
      {
        stdio: "inherit",
        shell: true,
      },
    );

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("module.exports"),
    );

    expect(log.success).toHaveBeenCalledWith(
      "Auth module + middleware generated successfully!",
    );
  });

  test("should generate express ES module middleware", async () => {
    mockedGetConfig.mockReturnValueOnce({
      framework: "express",
      module: "module",
    });
    selectMock.mockResolvedValueOnce("express").mockResolvedValueOnce("module");

    await generateAuth();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("export default"),
    );
  });

  test("should generate fastify middleware", async () => {
    mockedGetConfig.mockReturnValueOnce({
      framework: "fastify",
      module: "module",
    });
    selectMock.mockResolvedValueOnce("fastify").mockResolvedValueOnce("module");

    await generateAuth();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("auth.middleware.js"),
      expect.stringContaining("reply"),
    );
  });
});
