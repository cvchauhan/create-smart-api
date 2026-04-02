import { askRelations, processRelations } from "../../utils/relation.util";
import fs from "fs";
import * as prompts from "@clack/prompts";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));
jest.mock("path");

jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
  },
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

const mockedFs = fs as jest.Mocked<typeof fs>;
const confirmMock = prompts.confirm as jest.Mock;
const selectMock = prompts.select as jest.Mock;
const taxtMock = prompts.text as jest.Mock;

describe("askRelations", () => {
  it("should return empty array when hasRelations is false", async () => {
    confirmMock.mockResolvedValueOnce(false);
    const result = await askRelations();

    expect(result).toEqual([]);
  });
  it("should skip duplicate relation field", async () => {
    confirmMock.mockResolvedValueOnce(false);
    selectMock.mockResolvedValueOnce("1:1").mockResolvedValueOnce("User");
    taxtMock.mockResolvedValueOnce("roleId");
    confirmMock.mockResolvedValueOnce(true);

    const result = await askRelations();

    expect(result.length).toBe(1);
  });
});

describe("processRelations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip relation if model already exists", async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(["user.model.js"] as any);

    const relations = [
      {
        type: "1:1",
        target: "User",
        field: "roleId",
        required: true,
      },
    ];

    const result = await processRelations(
      relations,
      "/app",
      "mongodb",
      true,
      "quick",
    );

    expect(result.length).toBe(1);
  });
  it("should skip relation when user chooses Skip", async () => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.readdirSync.mockReturnValue([]);
    selectMock.mockResolvedValueOnce("Skip Relation");

    const result = await processRelations(
      [
        {
          type: "1:1",
          target: "Order",
          field: "userId",
          required: true,
        },
      ],
      "/app",
      "mongodb",
      true,
      "quick",
    );

    expect(result.length).toBe(0);
  });
});
