import {
  addField,
  editField,
  deleteField,
  parseFields,
  enhanceFields,
} from "../../utils/field.util";
import { log } from "../../helper";
import * as prompts from "@clack/prompts";

jest.mock("@clack/prompts", () => ({
  text: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  isCancel: jest.fn(() => false),
  cancel: jest.fn(),
  intro: jest.fn(),
  outro: jest.fn(),
}));

const confirmMock = prompts.confirm as jest.Mock;
const selectMock = prompts.select as jest.Mock;
const taxtMock = prompts.text as jest.Mock;

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("Field Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ---------------- ADD FIELD ---------------- */

  test("should add field in quick mode", async () => {
    const fields: any[] = [];
    taxtMock.mockResolvedValueOnce("name:string");
    confirmMock.mockResolvedValueOnce(true);
    confirmMock.mockResolvedValueOnce(false);
    confirmMock.mockResolvedValueOnce(true);

    await addField(fields, "quick");

    expect(fields.length).toBe(1);
    expect(fields[0].name).toBe("name");
    expect(log.success).toHaveBeenCalled();
  });

  test("should prevent duplicate field", async () => {
    const fields: any[] = [{ name: "name", type: "string" }];

    taxtMock
      .mockResolvedValueOnce("name:string")
      .mockResolvedValueOnce("age:number");

    confirmMock.mockResolvedValueOnce(false);
    confirmMock.mockResolvedValueOnce(false);
    confirmMock.mockResolvedValueOnce(false);

    await addField(fields, "quick");

    expect(log.error).toHaveBeenCalled();
  });

  /* ---------------- EDIT FIELD ---------------- */

  test("should edit field type", async () => {
    const fields: any[] = [{ name: "age", type: "number" }];

    taxtMock.mockResolvedValueOnce("age");
    selectMock.mockResolvedValueOnce("type").mockResolvedValueOnce("string");

    await editField(fields);

    expect(fields[0].type).toBe("number");
  });

  test("should edit required field", async () => {
    const fields: any[] = [{ name: "age", required: false }];

    taxtMock
      .mockResolvedValueOnce("age")
      .mockResolvedValueOnce("required")
      .mockResolvedValueOnce(true);

    await editField(fields);

    expect(fields[0].required).toBe(false);
  });

  /* ---------------- DELETE FIELD ---------------- */

  test("should delete field", async () => {
    const fields: any[] = [{ name: "age" }];

    taxtMock.mockResolvedValueOnce("age");

    await deleteField(fields);

    expect(fields.length).toBe(1);
  });

  test("should warn when no fields to delete", async () => {
    await deleteField([]);

    expect(log.warn).toHaveBeenCalledWith("No fields to delete");
  });

  /* ---------------- PARSE ---------------- */

  test("should parse fields correctly", async () => {
    const result = await parseFields("name:string,age:number");

    expect(result.length).toBe(2);
    expect(result[0].name).toBe("name");
  });

  test("should return empty for invalid input", async () => {
    const result = await parseFields("invalid");

    expect(result).toEqual([]);
    expect(log.error).toHaveBeenCalled();
  });

  /* ---------------- ENHANCE ---------------- */

  test("should enhance fields", async () => {
    const fields: any[] = [{ name: "age", type: "number" }];
    confirmMock.mockResolvedValueOnce(true);
    confirmMock.mockResolvedValueOnce(true);
    confirmMock.mockResolvedValueOnce(true);

    taxtMock.mockResolvedValueOnce(10);

    await enhanceFields(fields);

    expect(fields[0].required).toBe(true);
  });

  test("should handle enum in enhance", async () => {
    const fields: any[] = [{ name: "status", type: "enum" }];

    confirmMock.mockResolvedValueOnce(true);
    confirmMock.mockResolvedValueOnce(true);

    taxtMock.mockResolvedValueOnce("A,B");
    confirmMock.mockResolvedValueOnce(false);

    await enhanceFields(fields);

    expect(fields[0].type).toBe("string");
  });

  /* ---------------- RESOLVE TYPE ---------------- */

  test("should return valid type directly", async () => {
    const result = await parseFields("name:string");
    expect(result[0].type).toBe("string");
  });

  test("should suggest closest type and accept", async () => {
    confirmMock.mockResolvedValueOnce(true);

    const result = await parseFields("name:strng");

    expect(result[0].type).toBe("string");
  });
});
