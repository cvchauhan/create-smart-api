import { Field } from "../types/field";
import inquirer from "inquirer";
import { parseFields } from "./parseFields";
import { enhanceFields } from "./enhanceFields";
import { log } from "./chalk";

export async function addField(fields: Field[], mode?: string) {
  while (true) {
    let newField: Field;

    // ✅ QUICK MODE
    if (mode === "quick") {
      const { input } = await inquirer.prompt({
        type: "input",
        name: "input",
        message: "Enter field (name:type)",
        validate: (value) => {
          if (!value) return "Field input is required";
          if (!value.includes(":")) return "Use format name:type";
          return true;
        },
      });

      const parsed = await parseFields(input);
      newField = parsed[0];
    }

    // ✅ INTERACTIVE MODE
    else {
      newField = await askFieldDetails();
    }

    // 🔥 Prevent duplicate
    if (fields.find((f) => f.name === newField.name)) {
      log.error(`Field "${newField.name}" already exists`);
    } else {
      if (mode === "quick") {
        await enhanceFields([newField]);
      }
      fields.push(newField);
      log.success(`Field "${newField.name}" added`);
    }

    // 🔁 ASK AGAIN
    const { addMore } = await inquirer.prompt({
      type: "confirm",
      name: "addMore",
      message: "Add another field?",
      default: false,
    });

    if (!addMore) break;
  }
}

async function askFieldDetails(existing?: Field): Promise<Field> {
  let obj: any = {};

  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: "Field name:",
    default: existing?.name,
    validate: (val) => (!!val ? true : "Field name is required"),
  });

  const { type } = await inquirer.prompt({
    type: "select",
    name: "type",
    message: "Select field type:",
    choices: ["string", "number", "boolean", "date", "enum"],
    default: existing?.type || "string",
  });

  const { required } = await inquirer.prompt({
    type: "confirm",
    name: "required",
    message: "Is required?",
    default: existing?.required ?? false,
  });

  const { unique } = await inquirer.prompt({
    type: "confirm",
    name: "unique",
    message: "Is unique?",
    default: existing?.unique ?? false,
  });

  const { hasDefault } = await inquirer.prompt({
    type: "confirm",
    name: "hasDefault",
    message: `${name} default value?`,
    default: false,
  });

  if (hasDefault) {
    const { value } = await inquirer.prompt({
      type: "input",
      name: "value",
      message: `Default value for ${name}`,
    });
    obj.default = value;
  }

  let enumValues: string[] | undefined;

  if (type === "enum") {
    const { values } = await inquirer.prompt({
      type: "input",
      name: "values",
      message: "Enter enum values (comma separated):",
      default: existing?.enumValues?.join(",") || "",
    });

    enumValues = values.split(",").map((v: string) => v.trim());
  }
  obj = {
    ...obj,
    name,
    type,
    required,
    unique,
    enumValues,
  };

  return obj;
}
