import {
  fieldInputs,
  validateFieldInput,
  validateName,
  validateOnlyNumber,
} from "../../utils/field.validation.util";

// ---- Mock prompts ----
jest.mock("@clack/prompts", () => ({
  text: jest.fn(),
}));

jest.mock("../../utils/prompt.util", () => ({
  handleCancel: jest.fn((v) => v),
}));

describe("field.validation.util", () => {
  const { text } = require("@clack/prompts");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // ✅ fieldInputs
  // -----------------------------

  it("should skip prompt if fields already exist", async () => {
    const result = await fieldInputs([{ name: "test", type: "string" } as any]);

    expect(result).toEqual({ fieldInput: "" });
    expect(text).not.toHaveBeenCalled();
  });

  it("should prompt and return input when no fields provided", async () => {
    text.mockResolvedValueOnce("name:string");

    const result = await fieldInputs();

    expect(text).toHaveBeenCalled();
    expect(result).toEqual({ fieldInput: "name:string" });
  });

  // -----------------------------
  // ✅ validateFieldInput
  // -----------------------------

  it("should fail on empty input", () => {
    const result = validateFieldInput("");

    expect(result).toContain("Field input is required");
  });

  it("should fail on invalid format (missing colon)", () => {
    const result = validateFieldInput("name");

    expect(result).toContain("Invalid format");
  });

  it("should fail when field name is missing", () => {
    const result = validateFieldInput(":string");

    expect(result).toContain("Field name missing");
  });

  it("should fail when field type is missing", () => {
    const result = validateFieldInput("name:");

    expect(result).toContain("Field type missing");
  });

  it("should pass valid input", () => {
    const result = validateFieldInput("name:string,age:number");

    expect(result).toBeUndefined();
  });

  // -----------------------------
  // ✅ validateName
  // -----------------------------

  it("should fail when name is empty", () => {
    const result = validateName("");

    expect(result).toBe("Name is required");
  });

  it("should fail for invalid characters", () => {
    const result = validateName("name@123");

    expect(result).toBe("Only letters, numbers, ., _, - allowed");
  });

  it("should pass valid name", () => {
    const result = validateName("name_123.test");

    expect(result).toBeUndefined();
  });

  // -----------------------------
  // ✅ validateOnlyNumber
  // -----------------------------

  it("should fail when input is empty", () => {
    const result = validateOnlyNumber("");

    expect(result).toBe("Input is required");
  });

  it("should fail for non-numeric input", () => {
    const result = validateOnlyNumber("123a");

    expect(result).toBe("Only numbers are allowed");
  });

  it("should pass valid number", () => {
    const result = validateOnlyNumber("12345");

    expect(result).toBeUndefined();
  });
});
