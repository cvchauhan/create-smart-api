import Field from "../types/field";
import { prompt } from "../helper/promptAdapter";
import { log } from "../helper/index";
import { closest } from "fastest-levenshtein";
import { validateFieldInput, validateName } from "./field.validation.util";

class Fields {
  addField = async (fields: Field[], mode?: string) => {
    while (true) {
      let newField: Field;

      // ✅ QUICK MODE
      if (mode === "quick") {
        const { input } = await prompt([
          {
            type: "input",
            name: "input",
            message: "Enter field (name:type)",
            validate: validateFieldInput,
          },
        ]);

        const parsed = await this.parseFields(input);
        newField = parsed[0];
      }

      // ✅ INTERACTIVE MODE
      else {
        newField = await this.askFieldDetails();
      }

      // 🔥 Prevent duplicate
      if (fields.find((f) => f.name === newField.name)) {
        log.error(`Field "${newField.name}" already exists`);
        continue;
      } else {
        if (mode === "quick") {
          await this.enhanceFields([newField]);
        }
        fields.push(newField);
        log.success(`Field "${newField.name}" added`);
      }

      // 🔁 ASK AGAIN
      const { addMore } = await prompt([
        {
          type: "confirm",
          name: "addMore",
          message: "Add another field?",
          default: false,
        },
      ]);

      if (!addMore) break;
    }
  };

  editField = async (fields: Field[]) => {
    const { fieldName } = await prompt([
      {
        type: "select",
        name: "fieldName",
        message: "Select field to edit:",
        choices: fields.map((f) => f.name),
      },
    ]);

    const field = fields.find((f) => f.name === fieldName);
    if (!field) return;

    const { property } = await prompt([
      {
        type: "select",
        name: "property",
        message: `What do you want to edit for "${field.name}"?(type, required, unique, default, enum)`,
        default: "type",
        choices: [
          { name: "Type", value: "type" },
          { name: "Required", value: "required" },
          { name: "Unique", value: "unique" },
          { name: "Default", value: "default" },
          { name: "Enum Values", value: "enum" },
        ],
      },
    ]);

    switch (property) {
      case "type": {
        const { newType } = await prompt([
          {
            type: "select",
            name: "newType",
            message: "Enter new type:",
            default: field.type,
            choices: [
              "string",
              "number",
              "boolean",
              "date",
              "enum",
              "objectid",
            ],
          },
        ]);

        field.type = await this.resolveType(newType);
        break;
      }

      case "required": {
        const { val } = await prompt([
          {
            type: "confirm",
            name: "val",
            message: "Required?",
            default: field.required,
          },
        ]);

        field.required = val;
        break;
      }

      case "unique": {
        const { val } = await prompt([
          {
            type: "confirm",
            name: "val",
            message: "Unique?",
            default: field.unique,
          },
        ]);

        field.unique = val;
        break;
      }

      case "default": {
        const { val } = await prompt([
          {
            type: "input",
            name: "val",
            message: "Default value:",
            default: field.default || "",
          },
        ]);

        field.default = val;
        break;
      }

      case "enum": {
        const { val } = await prompt([
          {
            type: "input",
            name: "val",
            message: "Enter enum values (comma separated):",
            default: field.enumValues?.join(",") || "",
            validate: (input: string) => {
              if (!input.trim()) return "Enum values are required";
              return true;
            },
          },
        ]);

        field.enumValues = val.split(",").map((v: string) => v.trim());
        break;
      }
    }

    log.success(`Updated field "${field.name}"`);
  };

  deleteField = async (fields: Field[]) => {
    if (fields.length === 0) {
      log.warn("No fields to delete");
      return;
    }

    const { fieldName } = await prompt([
      {
        type: "select",
        name: "fieldName",
        message: "Select field to delete:",
        choices: fields.map((f) => f.name),
      },
    ]);

    const index = fields.findIndex((f) => f.name === fieldName);

    if (index !== -1) {
      fields.splice(index, 1);
      log.success(`Field "${fieldName}" deleted`);
    }
  };

  askFieldDetails = async (existing?: Field): Promise<Field> => {
    let obj: any = {};

    const { name } = await prompt([
      {
        type: "input",
        name: "name",
        message: "Field name:",
        default: existing?.name,
        validate: validateName,
      },
    ]);

    const { type } = await prompt([
      {
        type: "select",
        name: "type",
        message: "Select field type:",
        choices: ["string", "number", "boolean", "date", "enum", "objectid"],
        default: existing?.type || "string",
      },
    ]);

    const { required } = await prompt([
      {
        type: "confirm",
        name: "required",
        message: "Is required?",
        default: existing?.required ?? false,
      },
    ]);

    const { unique } = await prompt([
      {
        type: "confirm",
        name: "unique",
        message: "Is unique?",
        default: existing?.unique ?? false,
      },
    ]);

    const { hasDefault } = await prompt([
      {
        type: "confirm",
        name: "hasDefault",
        message: `${name} default value?`,
        default: false,
      },
    ]);

    if (hasDefault) {
      const { value } = await prompt([
        {
          type: "input",
          name: "value",
          message: `Default value for ${name}`,
        },
      ]);
      obj.default = value;
    }

    let enumValues: string[] | undefined;

    if (type === "enum") {
      const { values } = await prompt([
        {
          type: "input",
          name: "values",
          message: "Enter enum values (comma separated):",
          default: existing?.enumValues?.join(",") || "",
        },
      ]);

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
  };

  enhanceFields = async (fields: Field[]) => {
    for (const field of fields) {
      const { required, unique } = await prompt([
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
        const { values } = await prompt([
          {
            type: "input",
            name: "values",
            message: `Enter enum values for ${field.name}`,
          },
        ]);

        field.enumValues = values.split(",").map((v: string) => v.trim());
        field.type = "string";
      }

      const { hasDefault } = await prompt([
        {
          type: "confirm",
          name: "hasDefault",
          message: `${field.name} default value?`,
          default: false,
        },
      ]);

      if (hasDefault) {
        const { value } = await prompt([
          {
            type: "input",
            name: "value",
            message: `Default value for ${field.name}`,
          },
        ]);

        field.default = value;
      }
    }
  };

  parseFields = async (input: string): Promise<Field[]> => {
    const fields: Field[] = [];

    if (!input) {
      return [];
    }

    for (const item of input.split(",")) {
      const [name, type] = item.split(":");

      if (!name || !type) {
        log.error(`Invalid field: ${item}`);
        return [];
      }
      const resolvedType = await this.resolveType(type);

      fields.push({
        name: name.trim(),
        type: resolvedType,
      });
    }

    return fields;
  };

  resolveType = async (type: string): Promise<string> => {
    const allowedTypes = ["string", "number", "boolean", "date", "enum"];
    const cleanType = type.toLowerCase().trim();

    if (allowedTypes.includes(cleanType)) return cleanType;

    const suggestion = closest(cleanType, allowedTypes);

    const { confirm } = await prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Invalid type "${type}". Did you mean "${suggestion}"?`,
        default: true,
      },
    ]);

    if (confirm) return suggestion;

    const { manual } = await prompt([
      {
        type: "select",
        name: "manual",
        message: "Select correct type:",
        choices: allowedTypes,
        default: allowedTypes[0],
      },
    ]);

    return manual;
  };
}

const fields = new Fields();
export const addField = fields.addField.bind(fields);
export const editField = fields.editField.bind(fields);
export const deleteField = fields.deleteField.bind(fields);
export const parseFields = fields.parseFields.bind(fields);
export const enhanceFields = fields.enhanceFields.bind(fields);
