import { log } from "../helper";
import { showTablePreview } from "../helper/showTablePreview";
import Field from "../types/field";
import path from "path";
import create from "./create";
import {
  deleteField,
  addField,
  editField,
  parseFields,
  enhanceFields,
} from "../utils/field.util";

import { fieldInputs, validateName } from "../utils/field.validation.util";
import { askRelations, processRelations } from "../utils/relation.util";
import {
  generateSequelizeModel,
  generateMongooseModel,
  generateSequelizeIndex,
} from "../utils/model.util";
import { getConfig } from "../helper/getConfig";
import { existsSync, lstatSync } from "fs";
import { writeFile } from "fs/promises";

import { select, confirm, text } from "@clack/prompts";
import { handleCancel } from "../utils/prompt.util";

export default async function generateModel(
  name: string,
  moduleType: "module" | "commonjs",
  db: "mongodb" | "mssql" | "mysql",
  isESM: boolean,
  isCrud: boolean = false,
  modelPath?: string,
) {
  if (!name) {
    log.error("Model name is required");
    return;
  }

  const base = process.cwd();
  const srcPath = path.join(base, "./src");
  const config = getConfig(base);

  // ❌ No project found
  if (!existsSync(srcPath) || !lstatSync(srcPath).isDirectory()) {
    log.error("No project found.");

    const createNow = handleCancel(
      await confirm({
        message: "Create a new project now?",
        initialValue: true,
      }),
    );

    if (createNow) {
      const projectName = handleCancel(
        await text({
          message: "New project name?",
          initialValue: "my-app",
          validate: validateName as any,
        }),
      );

      await create(projectName as string);
    } else {
      log.warn("👉 Run: create-smart-api create");
    }

    return;
  }

  let selectedModule = config?.module || moduleType;
  let selectedDb = config?.db || db;

  // ✅ Ask only if missing
  if (!selectedModule) {
    const res = handleCancel(
      await select({
        message: "Module system",
        options: [
          { label: "ES Module", value: "module" },
          { label: "CommonJS", value: "commonjs" },
        ],
        initialValue: "commonjs",
      }),
    );

    selectedModule = res as "module" | "commonjs";
  }

  if (!selectedDb) {
    const res = handleCancel(
      await select({
        message: "Select DB",
        options: [
          { label: "mongodb", value: "mongodb" },
          { label: "mssql", value: "mssql" },
          { label: "mysql", value: "mysql" },
        ],
        initialValue: "mongodb",
      }),
    );

    selectedDb = res as "mongodb" | "mssql" | "mysql";
  }

  let modelFields: any[] = [];

  // ✅ Input mode
  const inputMode: any = handleCancel(
    await select({
      message: "create-smart-api > How do you want to define fields?",
      options: [
        { label: "Interactive", value: "interactive" },
        { label: "Quick input (name:string,...)", value: "quick" },
      ],
      initialValue: "interactive",
    }),
  );

  // ✅ Field input
  if (inputMode === "quick") {
    const { fieldInput } = await fieldInputs();
    modelFields = await parseFields(fieldInput);
    await enhanceFields(modelFields);
  } else {
    await addField(modelFields, inputMode);
  }

  normalizeFields(modelFields);

  // 🔁 Edit loop
  while (true) {
    showTablePreview(modelFields);

    const action = handleCancel(
      await select({
        message: "Select action:",
        initialValue: "continue",
        options: [
          { label: "✅ Continue", value: "continue" },
          { label: "✏️ Edit field", value: "edit" },
          { label: "➕ Add new field", value: "add" },
          { label: "❌ Delete field", value: "delete" },
          { label: "🚪 Cancel", value: "cancel" },
        ],
      }),
    );

    if (action === "continue") break;

    if (action === "cancel") {
      log.warn("Operation cancelled");
      return [];
    }

    if (action === "edit") {
      await editField(modelFields);
    }

    if (action === "add") {
      await addField(modelFields);
    }

    if (action === "delete") {
      await deleteField(modelFields);
    }
  }

  const selectModuleType = isESM || selectedModule === "module";

  let relations: any = await askRelations();

  relations = await processRelations(
    relations,
    base,
    selectedDb,
    selectModuleType,
    inputMode,
  );

  let modelContent: any = "";
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);

  if (selectedDb === "mongodb") {
    modelContent = generateMongooseModel(
      modelFields,
      modelName,
      selectModuleType,
      relations,
    );
  } else {
    modelContent = generateSequelizeModel(
      modelFields,
      modelName,
      selectModuleType,
      relations,
    );
    const indexContent = generateSequelizeIndex(isESM);
    await writeFile(path.join(base, "src/models", "index.js"), indexContent);
  }

  const selectedModelPath =
    modelPath || path.join(base, "src/models", `${modelName}.model.js`);

  await writeFile(selectedModelPath, modelContent);

  if (!isCrud) {
    log.successBox(`Model ${modelName} created successfully!`, {
      name: modelName,
      database: selectedDb,
    });
    return;
  }

  return relations;
}

export function normalizeFields(fields: Field[]): Field[] {
  return fields.map((f) => ({
    name: f.name,
    type: f.type || "string",
    required: f.required ?? false,
    unique: f.unique ?? false,
    default: f.default ?? undefined,
    enumValues: f.enumValues ?? [],
  }));
}
