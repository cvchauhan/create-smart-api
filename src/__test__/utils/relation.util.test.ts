import { askRelations, processRelations } from "../../utils/relation.util";

// ---- Mock fs ----
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  writeFile: jest.fn(),
}));

// ---- Mock path ----
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

// ---- Mock helpers ----
jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
  },
}));

// ---- Mock field utils ----
jest.mock("../../utils/field.util", () => ({
  addField: jest.fn(),
  parseFields: jest.fn(),
}));

jest.mock("../../utils/field.validation.util", () => ({
  validateName: jest.fn(() => true),
  fieldInputs: jest.fn(async () => ({
    fieldInput: "name:string",
  })),
}));

// ---- Mock model generators ----
jest.mock("../../utils/model.util", () => ({
  generateMongooseModel: jest.fn(() => "mongoose-model"),
  generateSequelizeModel: jest.fn(() => "sequelize-model"),
}));

// ---- Mock prompts ----
jest.mock("@clack/prompts", () => ({
  select: jest.fn(),
  confirm: jest.fn(),
  text: jest.fn(),
}));

jest.mock("../../utils/prompt.util", () => ({
  handleCancel: jest.fn((v) => v),
}));

describe("relation.util", () => {
  const { confirm, select, text } = require("@clack/prompts");
  const { existsSync, readdirSync } = require("fs");
  const { writeFile } = require("fs/promises");
  const { log } = require("../../helper");
  const { parseFields } = require("../../utils/field.util");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // ✅ askRelations
  // -----------------------------

  it("should return empty if user declines relations", async () => {
    confirm.mockResolvedValueOnce(false);

    const result = await askRelations();

    expect(result).toEqual([]);
  });

  it("should add a relation", async () => {
    confirm
      .mockResolvedValueOnce(true) // hasRelations
      .mockResolvedValueOnce(false) // required
      .mockResolvedValueOnce(false); // add more

    select.mockResolvedValueOnce("1:1");

    text
      .mockResolvedValueOnce("user") // target
      .mockResolvedValueOnce("userId"); // field

    const result = await askRelations();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      type: "1:1",
      target: "User",
      field: "userId",
      required: false,
    });
  });

  it("should prevent duplicate fields", async () => {
    confirm
      .mockResolvedValueOnce(true) // hasRelations
      .mockResolvedValueOnce(false) // required (1st)
      .mockResolvedValueOnce(true) // add more
      .mockResolvedValueOnce(false) // required (2nd)
      .mockResolvedValueOnce(false); // stop

    select.mockResolvedValueOnce("1:1").mockResolvedValueOnce("1:N");

    text
      .mockResolvedValueOnce("user") // target 1
      .mockResolvedValueOnce("userId") // field 1
      .mockResolvedValueOnce("role") // target 2
      .mockResolvedValueOnce("userId"); // field 2 (duplicate)

    const result = await askRelations();

    expect(result).toHaveLength(2);
  });

  // -----------------------------
  // ✅ processRelations
  // -----------------------------

  it("should skip if model already exists", async () => {
    existsSync.mockReturnValue(true);
    readdirSync.mockReturnValue(["user.model.js"]);

    const relations = [{ target: "User", field: "userId" }];

    const result = await processRelations(
      relations,
      "/base",
      "mongodb",
      true,
      "interactive",
    );

    expect(log.warn).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it("should create model when not exists (quick mode)", async () => {
    existsSync
      .mockReturnValueOnce(true) // models dir exists
      .mockReturnValueOnce(false); // model file doesn't exist

    readdirSync.mockReturnValue([]);

    select.mockResolvedValueOnce("create");

    parseFields.mockResolvedValueOnce([{ name: "name", type: "string" }]);

    const relations = [{ target: "Role", field: "roleId" }];

    const result = await processRelations(
      relations,
      "/base",
      "mongodb",
      true,
      "quick",
    );

    expect(writeFile).toHaveBeenCalled(); // ✅ now works
    expect(result).toHaveLength(1);
  });

  it("should skip relation when user ընտր skip", async () => {
    existsSync.mockReturnValue(true);
    readdirSync.mockReturnValue([]);

    select.mockResolvedValueOnce("skip");

    const relations = [{ target: "Role", field: "roleId" }];

    const result = await processRelations(
      relations,
      "/base",
      "mongodb",
      true,
      "interactive",
    );

    expect(log.warn).toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  // -----------------------------
  // ✅ createModelFile via processRelations
  // -----------------------------

  it("should not overwrite existing model file", async () => {
    existsSync
      .mockReturnValueOnce(true) // models dir
      .mockReturnValueOnce(true); // model exists

    readdirSync.mockReturnValue([]);

    select.mockResolvedValueOnce("create");

    const relations = [{ target: "User", field: "userId" }];

    const result = await processRelations(
      relations,
      "/base",
      "mongodb",
      true,
      "interactive",
    );

    expect(writeFile).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalled();
  });
});
