import createApp from "../../commands/create";

// Mock node modules
jest.mock("fs/promises", () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
  basename: jest.fn(() => "test-project"),
}));

// Mock generators & utils
jest.mock("../../generators/project", () => ({
  createStructure: jest.fn(),
}));

jest.mock("../../generators/crud", () => jest.fn());

jest.mock("../../utils/db.util", () => ({
  generateDbConfig: jest.fn(() => "db-config"),
}));

jest.mock("../../templates/env.template", () => jest.fn());
jest.mock("../../templates/package.json.template", () => jest.fn());

jest.mock("../../helper", () => ({
  log: {
    step: jest.fn(),
    info: jest.fn(),
    successBox: jest.fn(),
  },
}));

// Mock validations
jest.mock("../../utils/field.validation.util", () => ({
  validateOnlyNumber: jest.fn(() => true),
  validateName: jest.fn(() => true),
}));

// Mock prompts
jest.mock("@clack/prompts", () => ({
  text: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  intro: jest.fn(),
  outro: jest.fn(),
}));

jest.mock("../../utils/prompt.util", () => ({
  handleCancel: jest.fn((val) => val),
}));

describe("createApp CLI", () => {
  const { text, select, confirm } = require("@clack/prompts");

  const { mkdir, writeFile } = require("fs/promises");
  const { createStructure } = require("../../generators/project");
  const generateCrud = require("../../generators/crud");
  const generateEnvFile = require("../../templates/env.template");
  const generatePackageJson = require("../../templates/package.json.template");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create project with CRUD enabled", async () => {
    // Mock prompt responses
    text
      .mockResolvedValueOnce("my-app") // project name
      .mockResolvedValueOnce("sample") // module name
      .mockResolvedValueOnce("3000"); // port

    select
      .mockResolvedValueOnce("express") // framework
      .mockResolvedValueOnce("commonjs") // module
      .mockResolvedValueOnce("mongodb"); // db

    confirm.mockResolvedValueOnce(true); // CRUD enabled

    await createApp("");

    expect(mkdir).toHaveBeenCalled();
    expect(createStructure).toHaveBeenCalled();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("db.js"),
      "db-config",
    );

    expect(generateEnvFile).toHaveBeenCalledWith(
      3000,
      expect.any(String),
      "mongodb",
    );

    expect(generatePackageJson).toHaveBeenCalled();

    expect(generateCrud).toHaveBeenCalledWith(
      expect.any(String),
      "sample",
      "express",
      "commonjs",
      "mongodb",
      true,
    );
  });

  it("should skip CRUD when user selects false", async () => {
    text.mockResolvedValueOnce("my-app").mockResolvedValueOnce("3000");

    select
      .mockResolvedValueOnce("fastify")
      .mockResolvedValueOnce("module")
      .mockResolvedValueOnce("mysql");

    confirm.mockResolvedValueOnce(false);

    await createApp("");

    expect(generateCrud).not.toHaveBeenCalled();
  });

  it("should use provided name without prompting", async () => {
    select
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs")
      .mockResolvedValueOnce("mongodb");

    confirm.mockResolvedValueOnce(false);

    text.mockResolvedValueOnce("3000");

    await createApp("direct-name");

    // text for project name should NOT be called
    expect(text).not.toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Project name"),
      }),
    );
  });

  it("should handle different DB dialect mapping", async () => {
    text
      .mockResolvedValueOnce("my-app")
      .mockResolvedValueOnce("sample")
      .mockResolvedValueOnce("3000");

    select
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs")
      .mockResolvedValueOnce("mssql");

    confirm.mockResolvedValueOnce(true);

    const { generateDbConfig } = require("../../utils/db.util");

    await createApp("");

    expect(generateDbConfig).toHaveBeenCalledWith("commonjs", "mssql");
  });
});
