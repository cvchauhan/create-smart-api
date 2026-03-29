import { askRelations, processRelations } from "../../utils/relation.util";

import { prompt } from "../../helper/promptAdapter";
import fs from "fs";

jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

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

const mockedPrompt = prompt as jest.Mock;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("askRelations", () => {
  it("should return empty array when hasRelations is false", async () => {
    mockedPrompt.mockResolvedValueOnce({ hasRelations: false });

    const result = await askRelations();

    expect(result).toEqual([]);
  });
  it("should skip duplicate relation field", async () => {
    mockedPrompt
      .mockResolvedValueOnce({ hasRelations: true }) // first confirm
      .mockResolvedValueOnce({
        type: "1:1",
        target: "User",
        field: "roleId",
        required: true,
      }) // relation input
      .mockResolvedValueOnce({ more: false }); // stop loop

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

    mockedPrompt.mockResolvedValueOnce({ action: "Skip Relation" });

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
