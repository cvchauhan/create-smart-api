import generateCrud from "../../generators/crud";

// Mock dependencies
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

jest.mock("../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("../commands/model", () => jest.fn());
jest.mock("../utils/router.util", () => ({
  genrateRouter: jest.fn(),
}));

jest.mock("../templates/service.template", () => jest.fn());
jest.mock("../templates/controller.template", () => jest.fn());

jest.mock("@clack/prompts", () => ({
  intro: jest.fn(),
  outro: jest.fn(),
  select: jest.fn(),
}));

jest.mock("../utils/prompt.util", () => ({
  handleCancel: jest.fn((val) => val),
}));

describe("generateCrud", () => {
  const generateModel = require("../commands/model");
  const serviceGenrate = require("../templates/service.template");
  const generateController = require("../templates/controller.template");
  const { genrateRouter } = require("../utils/router.util");
  const { select } = require("@clack/prompts");
  const { log } = require("../helper");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if moduleName is missing", async () => {
    await generateCrud("/base", "" as any);

    expect(log.error).toHaveBeenCalledWith("Module name is required");
    expect(generateModel).not.toHaveBeenCalled();
  });

  it("should generate CRUD with all params provided (no prompts)", async () => {
    generateModel.mockResolvedValueOnce(["relation"]);

    await generateCrud("/base", "user", "express", "commonjs", "mongodb", true);

    expect(generateModel).toHaveBeenCalledWith(
      "user",
      "commonjs",
      "mongodb",
      false,
      true,
      expect.stringContaining("User.model.js"),
    );

    expect(serviceGenrate).toHaveBeenCalledWith(
      "mongodb",
      false,
      ["relation"],
      "user",
      expect.stringContaining("user.service.js"),
      true,
    );

    expect(generateController).toHaveBeenCalledWith(
      "user",
      false,
      expect.stringContaining("user.controller.js"),
    );

    expect(genrateRouter).toHaveBeenCalledWith(
      "user",
      "express",
      expect.stringContaining("routes/index.js"),
      "commonjs",
    );
  });

  it("should prompt for missing params", async () => {
    generateModel.mockResolvedValueOnce([]);

    select
      .mockResolvedValueOnce("fastify") // framework
      .mockResolvedValueOnce("module") // moduleType
      .mockResolvedValueOnce("mysql"); // db

    await generateCrud("/base", "product");

    expect(select).toHaveBeenCalledTimes(3);

    expect(generateModel).toHaveBeenCalledWith(
      "product",
      "module",
      "mysql",
      true,
      true,
      expect.any(String),
    );
  });

  it("should correctly detect ESM mode", async () => {
    generateModel.mockResolvedValueOnce([]);

    await generateCrud("/base", "order", "express", "module", "mongodb", true);

    expect(generateModel).toHaveBeenCalledWith(
      "order",
      "module",
      "mongodb",
      true, // ESM = true
      true,
      expect.any(String),
    );
  });

  it("should lowercase module name and capitalize model name", async () => {
    generateModel.mockResolvedValueOnce([]);

    await generateCrud(
      "/base",
      "UserProfile",
      "express",
      "commonjs",
      "mongodb",
      true,
    );

    expect(generateModel).toHaveBeenCalledWith(
      "userprofile",
      "commonjs",
      "mongodb",
      false,
      true,
      expect.stringContaining("Userprofile.model.js"),
    );
  });

  it("should call success log and outro when not isCreate", async () => {
    generateModel.mockResolvedValueOnce([]);

    const { outro } = require("@clack/prompts");

    await generateCrud(
      "/base",
      "user",
      "express",
      "commonjs",
      "mongodb",
      false,
    );

    expect(log.success).toHaveBeenCalledWith(
      'CRUD module "user" created successfully!',
    );

    expect(outro).toHaveBeenCalled();
  });

  it("should NOT call intro/outro when isCreate is true", async () => {
    generateModel.mockResolvedValueOnce([]);

    const { intro, outro } = require("@clack/prompts");

    await generateCrud("/base", "user", "express", "commonjs", "mongodb", true);

    expect(intro).not.toHaveBeenCalled();
    expect(outro).not.toHaveBeenCalled();
  });
});
