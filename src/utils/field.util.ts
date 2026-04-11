import Field from "../types/field";
import { log } from "../helper/index";
import { closest } from "fastest-levenshtein";
import { validateFieldInput, validateName } from "./field.validation.util";
import { handleCancel } from "./prompt.util";

class Fields {
  addField = async (fields: Field[], mode?: string) => {
    const { text, confirm } = require("@clack/prompts");
    while (true) {
      let newField: Field;

      // ✅ QUICK MODE
      if (mode === "quick") {
        const input = handleCancel(
          await text({
            message: "Enter field (name:type)",
            validate: validateFieldInput as any,
          }),
        );

        const parsed = await this.parseFields(input as string);
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
      const addMore = handleCancel(
        await confirm({
          message: "Add another field?",
          initialValue: false,
        }),
      );

      if (!addMore) break;
    }
  };

  editField = async (fields: Field[]) => {
    const { text, select, confirm } = require("@clack/prompts");
    const fieldName = handleCancel(
      await select({
        message: "Select field to edit:",
        options: fields.map((f) => ({
          label: f.name,
          value: f.name,
        })),
      }),
    );
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return;

    const property = handleCancel(
      await select({
        message: `What do you want to edit for "${field.name}"?`,
        initialValue: "type",
        options: [
          { label: "Type", value: "type" },
          { label: "Required", value: "required" },
          { label: "Unique", value: "unique" },
          { label: "Default", value: "default" },
          { label: "Enum Values", value: "enum" },
        ],
      }),
    );

    switch (property) {
      case "type": {
        const newType = handleCancel(
          await select({
            message: "Enter new type:",
            initialValue: field.type,
            options: [
              "string",
              "number",
              "boolean",
              "date",
              "enum",
              "objectid",
            ].map((v) => ({ label: v, value: v })),
          }),
        );

        field.type = await this.resolveType(newType as string);
        break;
      }

      case "required": {
        const val = handleCancel(
          await confirm({
            message: "Required?",
            initialValue: field.required,
          }),
        );

        field.required = val as boolean;
        break;
      }

      case "unique": {
        const val = handleCancel(
          await confirm({
            message: "Unique?",
            initialValue: field.unique,
          }),
        );

        field.unique = val as boolean;
        break;
      }

      case "default": {
        const val = handleCancel(
          await text({
            message: "Default value:",
            initialValue: field.default || "",
          }),
        );

        field.default = val as string;
        break;
      }

      case "enum": {
        const val = handleCancel(
          await text({
            message: "Enter enum values (comma separated):",
            initialValue: field.enumValues?.join(",") || "",
            validate: (value: string | undefined) => {
              if (!value || !value.trim()) return "Enum values are required";
              return undefined;
            },
          }),
        );

        field.enumValues = (val as string).split(",").map((v) => v.trim());
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
    const { select } = require("@clack/prompts");
    const fieldName: any = handleCancel(
      await select({
        message: "Select field to delete:",
        options: fields.map((f) => ({
          label: f.name,
          value: f.name,
        })),
        initialValue: fields[0].name,
      }),
    );

    const index = fields.findIndex((f) => f.name === fieldName);

    if (index !== -1) {
      fields.splice(index, 1);
      log.success(`Field ${fieldName} deleted`);
    }
  };

  askFieldDetails = async (existing?: Field): Promise<Field> => {
    const { text, select, confirm } = require("@clack/prompts");
    let obj: any = {};
    const name: any = handleCancel(
      await text({
        message: "Field name:",
        initialValue: existing?.name,
        validate: validateName as any,
      }),
    );

    const type = handleCancel(
      await select({
        message: "Select field type:",
        options: [
          "string",
          "number",
          "boolean",
          "date",
          "enum",
          "objectid",
        ].map((v) => ({ label: v, value: v })),
        initialValue: existing?.type || "string",
      }),
    );

    const required = handleCancel(
      await confirm({
        message: "Is required?",
        initialValue: existing?.required ?? false,
      }),
    );

    const unique = handleCancel(
      await confirm({
        message: "Is unique?",
        initialValue: existing?.unique ?? false,
      }),
    );

    const hasDefault = handleCancel(
      await confirm({
        message: `${name} default value?`,
        initialValue: false,
      }),
    );

    if (hasDefault) {
      const value = handleCancel(
        await text({
          message: `Default value for ${name}`,
        }),
      );

      obj.default = value;
    }

    let enumValues: string[] | undefined;

    if (type === "enum") {
      const values = handleCancel(
        await text({
          message: "Enter enum values (comma separated):",
          initialValue: existing?.enumValues?.join(",") || "",
        }),
      );

      enumValues = (values as string).split(",").map((v) => v.trim());
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
    const { text, confirm } = require("@clack/prompts");
    for (const field of fields) {
      const required = handleCancel(
        await confirm({
          message: `${field.name} required?`,
          initialValue: false,
        }),
      );

      const unique = handleCancel(
        await confirm({
          message: `${field.name} unique?`,
          initialValue: false,
        }),
      );

      field.required = required as boolean;
      field.unique = unique as boolean;

      if (field.type === "enum") {
        const values = handleCancel(
          await text({
            message: `Enter enum values for ${field.name}`,
          }),
        );

        field.enumValues = (values as string).split(",").map((v) => v.trim());
        field.type = "string";
      }

      const hasDefault = handleCancel(
        await confirm({
          message: `${field.name} default value?`,
          initialValue: false,
        }),
      );

      if (hasDefault) {
        const value = handleCancel(
          await text({
            message: `Default value for ${field.name}`,
          }),
        );

        field.default = value as string;
      }
    }
  };

  parseFields = async (input: string): Promise<Field[]> => {
    const fields: Field[] = [];

    if (!input) return [];

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
    const { select, confirm } = require("@clack/prompts");
    const confirmType = handleCancel(
      await confirm({
        message: `Invalid type "${type}". Did you mean "${suggestion}"?`,
        initialValue: true,
      }),
    );

    if (confirmType) return suggestion;

    const manual = handleCancel(
      await select({
        message: "Select correct type:",
        options: allowedTypes.map((v) => ({ label: v, value: v })),
        initialValue: allowedTypes[0],
      }),
    );

    return manual as string;
  };
}

const fields = new Fields();
export const addField = fields.addField.bind(fields);
export const editField = fields.editField.bind(fields);
export const deleteField = fields.deleteField.bind(fields);
export const parseFields = fields.parseFields.bind(fields);
export const enhanceFields = fields.enhanceFields.bind(fields);
