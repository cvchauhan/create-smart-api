import { Field } from "../types/field";
import inquirer from "inquirer";

export async function enhanceFields(fields: Field[]) {
  for (const field of fields) {
    const { required, unique } = await inquirer.prompt([
      {
        type: "confirm",
        name: "required",
        message: `${field.name} required?`,
        default: false,
      },
      {
        type: "confirm",
        name: "unique",
        message: `${field.name} unique?`,
        default: false,
      },
    ]);

    field.required = required;
    field.unique = unique;

    if (field.type === "enum") {
      const { values } = await inquirer.prompt({
        type: "input",
        name: "values",
        message: `Enter enum values for ${field.name}`,
      });

      field.enumValues = values.split(",").map((v: string) => v.trim());
      field.type = "string";
    }

    const { hasDefault } = await inquirer.prompt({
      type: "confirm",
      name: "hasDefault",
      message: `${field.name} default value?`,
      default: false,
    });

    if (hasDefault) {
      const { value } = await inquirer.prompt({
        type: "input",
        name: "value",
        message: `Default value for ${field.name}`,
      });

      field.default = value;
    }
  }
}
