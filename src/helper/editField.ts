import inquirer from "inquirer";
import { Field } from "../types/field";
import { resolveType } from "./resolveType";
import { log } from "./chalk";

export async function editField(fields: Field[]) {
  const { fieldName } = await inquirer.prompt({
    type: "rawlist",
    name: "fieldName",
    message: "Select field to edit:",
    choices: fields.map((f) => f.name),
  });

  const field = fields.find((f) => f.name === fieldName);
  if (!field) return;

  const { property } = await inquirer.prompt({
    type: "rawlist",
    name: "property",
    message: `What do you want to edit for "${field.name}"?(type, required, unique, default, enum)`,
    choices: [
      { name: "Type", value: "type" },
      { name: "Required", value: "required" },
      { name: "Unique", value: "unique" },
      { name: "Default", value: "default" },
      { name: "Enum Values", value: "enum" },
    ],
  });

  switch (property) {
    case "type": {
      const { newType } = await inquirer.prompt({
        type: "input",
        name: "newType",
        message: "Enter new type:",
        default: field.type,
      });

      field.type = await resolveType(newType);
      break;
    }

    case "required": {
      const { val } = await inquirer.prompt({
        type: "confirm",
        name: "val",
        message: "Required?",
        default: field.required,
      });

      field.required = val;
      break;
    }

    case "unique": {
      const { val } = await inquirer.prompt({
        type: "confirm",
        name: "val",
        message: "Unique?",
        default: field.unique,
      });

      field.unique = val;
      break;
    }

    case "default": {
      const { val } = await inquirer.prompt({
        type: "input",
        name: "val",
        message: "Default value:",
        default: field.default || "",
      });

      field.default = val;
      break;
    }

    case "enum": {
      const { val } = await inquirer.prompt({
        type: "input",
        name: "val",
        message: "Enter enum values (comma separated):",
        default: field.enumValues?.join(",") || "",
        validate: (input: string) => {
          if (!input.trim()) return "Enum values are required";
          return true;
        },
      });

      field.enumValues = val.split(",").map((v: string) => v.trim());
      break;
    }
  }

  log.success(`Updated field "${field.name}"`);
}
