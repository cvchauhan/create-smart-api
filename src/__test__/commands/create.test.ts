import createApp from "../../commands/create";

// ---- Mock fs ----
jest.mock("node:fs/promises", () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

// ---- Mock path ----
jest.mock("node:path", () => ({
  join: jest.fn((...args) => args.join("/")),
  basename: jest.fn((p) => p.split("/").pop()),
}));

// ---- Mock generators ----
jest.mock("../../generators/project", () => ({
  createStructure: jest.fn(),
}));

jest.mock("../../generators/crud", () => jest.fn());

// ---- Mock utils ----
jest.mock("../../utils/db.util", () => ({
  generateDbConfig: jest.fn(() => "db-config"),
}));

jest.mock("../../utils/field.validation.util", () => ({
  validateOnlyNumber: jest.fn(() => true),
  validateName: jest.fn(() => true),
}));

jest.mock("../../utils/prompt.util", () => ({
  handleCancel: jest.fn((val) => val),
}));

// ---- Mock templates ----
jest.mock("../../templates/env.template", () => jest.fn());
jest.mock("../../templates/package.json.template", () => jest.fn());

// ---- Mock logger ----
jest.mock("../../helper", () => ({
  log: {
    step: jest.fn(),
    info: jest.fn(),
    successBox: jest.fn(),
  },
}));

// ---- Mock prompts ----
jest.mock("@clack/prompts", () => ({
  text: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  intro: jest.fn(),
  outro: jest.fn(),
}));

describe("createApp CLI", () => {
  const { text, select, confirm } = require("@clack/prompts");
  const { mkdir, writeFile } = require("node:fs/promises");
  const { createStructure } = require("../../generators/project");
  const generateCrud = require("../../generators/crud");
  const generateEnvFile = require("../../templates/env.template");
  const generatePackageJson = require("../../templates/package.json.template");
  const { generateDbConfig } = require("../../utils/db.util");

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(process, "cwd").mockReturnValue("/mock-root");
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });

  // ✅ FULL FLOW TEST
  it("should create project with CRUD enabled", async () => {
    text
      .mockResolvedValueOnce("my-app") // project name
      .mockResolvedValueOnce("sample") // module name
      .mockResolvedValueOnce("3000"); // port

    select
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs")
      .mockResolvedValueOnce("mongodb");

    confirm.mockResolvedValueOnce(true);

    await createApp("");

    expect(mkdir).toHaveBeenCalledWith("/mock-root/my-app", expect.any(Object));

    expect(createStructure).toHaveBeenCalled();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("db.js"),
      "db-config",
    );

    expect(generateDbConfig).toHaveBeenCalledWith("commonjs", "mongodb");

    expect(generateEnvFile).toHaveBeenCalledWith(
      3000,
      expect.stringContaining(".env"),
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

  // ✅ NO CRUD FLOW
  it("should skip CRUD when disabled", async () => {
    text.mockResolvedValueOnce("my-app").mockResolvedValueOnce("3000");

    select
      .mockResolvedValueOnce("fastify")
      .mockResolvedValueOnce("module")
      .mockResolvedValueOnce("mysql");

    confirm.mockResolvedValueOnce(false);

    await createApp("");

    expect(generateCrud).not.toHaveBeenCalled();
  });

  // ✅ DIRECT NAME (NO PROMPT)
  it("should use provided name without asking project name", async () => {
    select
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs")
      .mockResolvedValueOnce("mongodb");

    confirm.mockResolvedValueOnce(false);

    text.mockResolvedValueOnce("3000");

    await createApp("direct-app");

    expect(mkdir).toHaveBeenCalledWith(
      "/mock-root/direct-app",
      expect.any(Object),
    );
  });

  // ✅ DB DIALECT TEST
  it("should map DB dialect correctly (mssql)", async () => {
    text
      .mockResolvedValueOnce("my-app")
      .mockResolvedValueOnce("sample")
      .mockResolvedValueOnce("3000");

    select
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs")
      .mockResolvedValueOnce("mssql");

    confirm.mockResolvedValueOnce(true);

    await createApp("");

    expect(generateDbConfig).toHaveBeenCalledWith("commonjs", "mssql");
  });

  // ✅ CURRENT DIRECTORY MODE
  it("should use current directory when '.' is selected", async () => {
    text
      .mockResolvedValueOnce(".") // current dir
      .mockResolvedValueOnce("sample")
      .mockResolvedValueOnce("3000");

    select
      .mockResolvedValueOnce("express")
      .mockResolvedValueOnce("commonjs")
      .mockResolvedValueOnce("mongodb");

    confirm.mockResolvedValueOnce(true);

    await createApp("");

    expect(mkdir).toHaveBeenCalledWith("/mock-root", expect.any(Object));
  });
});
