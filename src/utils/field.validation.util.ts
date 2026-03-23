import inquirer from "inquirer";
import Field from "../types/field";

class FieldValidation {
  fieldInputs = async (fields?: Field[]): Promise<{ fieldInput: string }> => {
    return await inquirer.prompt({
      type: "input",
      name: "fieldInput",
      when: () => !fields?.length,
      validate: this.validateFieldInput,
      message:
        "Enter fields (e.g. name:string,email:string,age:number,status:enum)",
    });
  };

  validateFieldInput = async (input: string) => {
    if (!input || !input.trim()) {
      return "❌ Field input is required (e.g:name:string)";
    }

    const fields = input.split(",");

    for (const field of fields) {
      const parts = field.split(":");

      if (parts.length < 2) {
        return `❌ Invalid format: "${field}". Use name:type (e.g:name:string)`;
      }

      const [name, type] = parts;

      if (!name.trim()) {
        return `❌ Field name missing in "${field}" (e.g:name:string)`;
      }

      if (!type.trim()) {
        return `❌ Field type missing in "${field}" (e.g:name:string)`;
      }
    }

    return true;
  };

  validateOnlyString = async (input: string) => {
    const regex = /^[a-zA-Z0-9_-]+$/;

    if (!input) {
      return "Name is required";
    }

    if (!regex.test(input)) {
      return "Special characters or numbers are not allowed";
    }

    return true;
  };
  validateOnlyNumber = async (input: string) => {
    const regex = /^[0-9]+$/;

    if (!input) {
      return "Input is required";
    }

    if (!regex.test(input)) {
      return "Only numbers are allowed";
    }

    return true;
  };
}

const fieldValidation = new FieldValidation();
export const fieldInputs = fieldValidation.fieldInputs.bind(fieldValidation);
export const validateOnlyString =
  fieldValidation.validateOnlyString.bind(fieldValidation);
export const validateOnlyNumber =
  fieldValidation.validateOnlyNumber.bind(fieldValidation);
