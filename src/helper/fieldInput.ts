import inquirer from "inquirer";
import { Field } from "../types/field";

export async function fieldInputs(
  fields?: Field[],
): Promise<{ fieldInput: string }> {
  return await inquirer.prompt({
    type: "input",
    name: "fieldInput",
    when: () => !fields?.length,
    validate: validateFieldInput,
    message:
      "Enter fields (e.g. name:string,email:string,age:number,status:enum)",
  });
}

export async function validateFieldInput(input: string) {
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
}

export async function validateOnlyString(input: string) {
  const regex = /^[a-zA-Z]+$/; // only letters

  if (!input) {
    return "Name is required";
  }

  if (!regex.test(input)) {
    return "Special characters or numbers are not allowed";
  }

  return true;
}
export async function validateOnlyNumber(input: string) {
  const regex = /^[0-9]+$/;

  if (!input) {
    return "Input is required";
  }

  if (!regex.test(input)) {
    return "Only numbers are allowed";
  }

  return true;
}
