import {
  fieldInputs,
  validateFieldInput,
  validateName,
  validateOnlyNumber,
} from "../../utils/field.validation.util";

import { prompt } from "../../helper/promptAdapter";

jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

const mockedPrompt = prompt as jest.Mock;

describe("fieldInputs", () => {
  it("should call prompt when fields are not provided", async () => {
    mockedPrompt.mockResolvedValue({ fieldInput: "name:string" });

    const result = await fieldInputs([]);

    expect(mockedPrompt).toHaveBeenCalled();
    expect(result).toEqual({ fieldInput: "name:string" });
  });
});

describe("validateFieldInput", () => {
  it("should return error for empty input", async () => {
    const res = await validateFieldInput("");

    expect(res).toBe("❌ Field input is required (e.g:name:string)");
  });

  it("should validate correct input", async () => {
    const res = await validateFieldInput("name:string,email:string");

    expect(res).toBe(true);
  });

  it("should fail if missing ':'", async () => {
    const res = await validateFieldInput("name");

    expect(res).toBe(
      '❌ Invalid format: "name". Use name:type (e.g:name:string)',
    );
  });

  it("should fail if name missing", async () => {
    const res = await validateFieldInput(":string");

    expect(res).toBe('❌ Field name missing in ":string" (e.g:name:string)');
  });

  it("should fail if type missing", async () => {
    const res = await validateFieldInput("name:");

    expect(res).toBe('❌ Field type missing in "name:" (e.g:name:string)');
  });
});

describe("validateName", () => {
  it("should return error if empty", async () => {
    const res = await validateName("");

    expect(res).toBe("Name is required");
  });

  it("should fail for special characters", async () => {
    const res = await validateName("name@123");

    expect(res).toBe("Special characters only allowed string, number & (_,-)");
  });

  it("should pass valid name", async () => {
    const res = await validateName("name_123");

    expect(res).toBe(true);
  });
});

describe("validateOnlyNumber", () => {
  it("should return error if empty", async () => {
    const res = await validateOnlyNumber("");

    expect(res).toBe("Input is required");
  });

  it("should fail if contains letters", async () => {
    const res = await validateOnlyNumber("12a3");

    expect(res).toBe("Only numbers are allowed");
  });

  it("should pass valid number", async () => {
    const res = await validateOnlyNumber("123456");

    expect(res).toBe(true);
  });
});
