import { Field } from "../types/field";
import inquirer from "inquirer";
import { parseFields } from "./parseFields";
import { enhanceFields } from "./enhanceFields";
import { log } from "./chalk";
import { validateFieldInput } from "./fieldInput";

export async function addField(fields: Field[]) {
  const { input } = await inquirer.prompt({
    type: "input",
    name: "input",
    message: "Enter new field (name:type)",
    validate: async (value) => {
      if (!value) {
        return "Field input is required";
      }
      const parts = value.split(":");

      if (parts.length < 2) {
        return `❌ Invalid format: "${value}". Use name:type (e.g:name:string)`;
      }

      const [name, type] = parts;

      if (!name.trim()) {
        return `❌ Field name missing in "${value}" (e.g:name:string)`;
      }

      if (!type.trim()) {
        return `❌ Field type missing in "${value}" (e.g:name:string)`;
      }
      const parsed = await parseFields(value);

      if (!parsed || parsed.length !== 1) {
        return "Only one field allowed (format: name:type)";
      }

      return true;
    },
  });
  if (!input) {
    log.error("Field input is required");
    return;
  }
  const parsed = await parseFields(input);

  const newField = parsed[0];

  // prevent duplicate
  if (fields.find((f) => f.name === newField.name)) {
    log.error("Field already exists");
    return;
  }

  await enhanceFields([newField]);

  fields.push(newField);

  log.success(`Field "${newField.name}" added`);
}
