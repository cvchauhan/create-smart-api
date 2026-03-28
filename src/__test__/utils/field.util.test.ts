import {
  addField,
  editField,
  deleteField,
  parseFields,
  enhanceFields,
} from "../../utils/field.util";

import { prompt } from "../../helper/promptAdapter";
import { log } from "../../helper";

// ✅ mocks
jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const promptMock = prompt as jest.Mock;
promptMock.mockImplementation(async () => ({}));
describe("Field Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ---------------- ADD FIELD ---------------- */

  test("should add field in quick mode", async () => {
    const fields: any[] = [];

    promptMock
      .mockResolvedValueOnce({ input: "name:string" }) // parse
      .mockResolvedValueOnce({ required: true, unique: false }) // enhance
      .mockResolvedValueOnce({ addMore: false }); // loop exit

    await addField(fields, "quick");

    expect(fields.length).toBe(1);
    expect(fields[0].name).toBe("name");
    expect(log.success).toHaveBeenCalled();
  });

  test("should prevent duplicate field", async () => {
    const fields: any[] = [{ name: "name", type: "string" }];

    promptMock
      .mockResolvedValueOnce({ input: "name:string" }) // duplicate
      .mockResolvedValueOnce({ input: "age:number" }) // next valid
      .mockResolvedValueOnce({ required: false, unique: false })
      .mockResolvedValueOnce({ addMore: false });

    await addField(fields, "quick");

    expect(log.error).toHaveBeenCalled();
  });

  /* ---------------- EDIT FIELD ---------------- */

  test("should edit field type", async () => {
    const fields: any[] = [{ name: "age", type: "number" }];

    promptMock
      .mockResolvedValueOnce({ fieldName: "age" })
      .mockResolvedValueOnce({ property: "type" })
      .mockResolvedValueOnce({ newType: "string" });

    await editField(fields);

    expect(fields[0].type).toBe("string");
    expect(log.success).toHaveBeenCalled();
  });

  test("should edit required field", async () => {
    const fields: any[] = [{ name: "age", required: false }];

    promptMock
      .mockResolvedValueOnce({ fieldName: "age" })
      .mockResolvedValueOnce({ property: "required" })
      .mockResolvedValueOnce({ val: true });

    await editField(fields);

    expect(fields[0].required).toBe(true);
  });

  /* ---------------- DELETE FIELD ---------------- */

  test("should delete field", async () => {
    const fields: any[] = [{ name: "age" }];

    promptMock.mockResolvedValueOnce({ fieldName: "age" });

    await deleteField(fields);

    expect(fields.length).toBe(0);
    expect(log.success).toHaveBeenCalled();
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

    promptMock
      .mockResolvedValueOnce({ required: true, unique: true })
      .mockResolvedValueOnce({ hasDefault: true })
      .mockResolvedValueOnce({ value: 10 });

    await enhanceFields(fields);

    expect(fields[0].required).toBe(true);
    expect(fields[0].default).toBe(10);
  });

  test("should handle enum in enhance", async () => {
    const fields: any[] = [{ name: "status", type: "enum" }];

    promptMock
      .mockResolvedValueOnce({ required: false, unique: false })
      .mockResolvedValueOnce({ values: "A,B" })
      .mockResolvedValueOnce({ hasDefault: false });

    await enhanceFields(fields);

    expect(fields[0].enumValues).toEqual(["A", "B"]);
    expect(fields[0].type).toBe("string");
  });

  /* ---------------- RESOLVE TYPE ---------------- */

  test("should return valid type directly", async () => {
    const result = await parseFields("name:string");
    expect(result[0].type).toBe("string");
  });

  test("should suggest closest type and accept", async () => {
    promptMock.mockResolvedValueOnce({ confirm: true });

    const result = await parseFields("name:strng");

    expect(result[0].type).toBe("string");
  });

  test("should allow manual type selection", async () => {
    promptMock
      .mockResolvedValueOnce({ confirm: false })
      .mockResolvedValueOnce({ manual: "number" });

    const result = await parseFields("age:numbr");

    expect(result[0].type).toBe("number");
  });
});
