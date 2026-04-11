import Field from "../types/field";
import { handleCancel } from "./prompt.util";

class FieldValidation {
  fieldInputs = async (fields?: Field[]): Promise<{ fieldInput: string }> => {
    // ✅ skip if already exists
    if (fields?.length) {
      return { fieldInput: "" };
    }
    const { text } = require("@clack/prompts");
    const fieldInput = handleCancel(
      await text({
        message:
          "Enter fields (e.g. name:string,email:string,age:number,status:enum)",
        validate: this.validateFieldInput as any,
      }),
    );
    return { fieldInput: fieldInput as string };
  };

  validateFieldInput = (input: string): string | undefined => {
    if (!input || !input.trim()) {
      return "❌ Field input is required (e.g:name:string)";
    }

    const fields = input.split(",");

    for (const field of fields) {
      const parts = field.split(":");

      if (parts.length < 2) {
        return `❌ Invalid format: "${field}". Use name:type`;
      }

      const [name, type] = parts;

      if (!name.trim()) {
        return `❌ Field name missing in "${field}"`;
      }

      if (!type.trim()) {
        return `❌ Field type missing in "${field}"`;
      }
    }

    return undefined; // ✅ valid
  };

  validateName = (input: string): string | undefined => {
    const regex = /^[a-zA-Z0-9._-]+$/;

    if (!input) {
      return "Name is required";
    }

    if (!regex.test(input)) {
      return "Only letters, numbers, ., _, - allowed";
    }

    return undefined; // ✅ valid
  };

  validateOnlyNumber = (input: string): string | undefined => {
    const regex = /^[0-9]+$/;

    if (!input) {
      return "Input is required";
    }

    if (!regex.test(input)) {
      return "Only numbers are allowed";
    }

    return undefined; // ✅ valid
  };
}

const fieldValidation = new FieldValidation();
export const fieldInputs = fieldValidation.fieldInputs.bind(fieldValidation);
export const validateFieldInput =
  fieldValidation.validateFieldInput.bind(fieldValidation);
export const validateName = fieldValidation.validateName.bind(fieldValidation);
export const validateOnlyNumber =
  fieldValidation.validateOnlyNumber.bind(fieldValidation);
