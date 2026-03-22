import {
  generateMongooseModel,
  generateSequelizeModel,
  parseFields,
  enhanceFields,
  showTablePreview,
  askRelations,
  addField,
  editField,
  deleteField,
  log,
} from "../helper";
import { Field } from "../types/field";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import create from "./create";
import { fieldInputs, validateOnlyString } from "../helper/fieldInput";

export default async function generateModel(
  name: string,
  moduleType: "module" | "commonjs",
  db: "mongodb" | "mssql" | "mysql",
  isESM: boolean,
  isCrud: boolean = false,
) {
  if (!name) {
    log.error("Model name is required");
    return;
  }
  const base = process.cwd();
  const srcPath = path.join(base, "./src");
  if (!fs.existsSync(srcPath) || !fs.lstatSync(srcPath).isDirectory()) {
    log.error("No project found.");

    const { createNow } = await inquirer.prompt([
      {
        type: "confirm",
        name: "createNow",
        message: "Create a new project now?",
        default: true,
      },
    ]);

    if (createNow) {
      const { projectName } = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "new project name?",
          default: "my-app",
          required: true,
          validate: validateOnlyString,
        },
      ]);
      await create(projectName);
    } else {
      log.warn("👉 Run: create-smart-api create");
    }
    return;
  }
  const answers = await inquirer.prompt([
    {
      type: "rawlist",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
      when: () => !moduleType,
    },
    {
      type: "select",
      name: "db",
      message: "Select DB",
      default: "mongodb",
      choices: ["mongodb", "mssql", "mysql"],
      when: () => !db,
    },
  ]);

  const selectedDb = db || answers.db;
  let modelFields: any[] = [];
  const { inputMode } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "inputMode",
      message: "create-smart-api > How do you want to define fields?",
      choices: [
        { name: "Interactive", value: "interactive" },
        { name: "Quick input (name:string,...)", value: "quick" },
      ],
      default: "interactive",
    },
  ]);

  if (inputMode === "quick") {
    const { fieldInput } = await fieldInputs();
    modelFields = await parseFields(fieldInput);
    await enhanceFields(modelFields);
  } else {
    await addField(modelFields, inputMode);
  }

  normalizeFields(modelFields);

  while (true) {
    showTablePreview(modelFields);

    const { action } = await inquirer.prompt({
      type: "rawlist",
      name: "action",
      default: "continue",
      message: "Select action:",
      choices: [
        { name: "✅ Continue", value: "continue" },
        { name: "✏️ Edit field", value: "edit" },
        { name: "➕ Add new field", value: "add" },
        { name: "❌ Delete field", value: "delete" },
        { name: "🚪 Cancel", value: "cancel" },
      ],
    });

    if (action === "continue") break;

    if (action === "cancel") {
      log.warn("Operation cancelled");
      return { modelContent: "", relations: [] };
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

  const selectModuleType = isESM || answers.moduleType === "module";
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
  }
  if (!isCrud) {
    const modelPath = path.join(base, "src/models", `${modelName}.model.js`);
    await fs.writeFile(modelPath, modelContent);
    log.success(`Model ${modelName} created successfully`);
    return;
  }
  return { modelContent, relations };
}

async function processRelations(
  relations: any[],
  basePath: string,
  db: "mongodb" | "mssql" | "mysql",
  isESM: boolean,
  inputMode: "interactive" | "quick",
) {
  const modelsPath = path.join(basePath, "src/models");

  const existingModels = fs.existsSync(modelsPath)
    ? fs.readdirSync(modelsPath).map((f) => f.replace(/\.model\.(js|ts)$/, ""))
    : [];

  const finalRelations: any[] = [];
  const createdModels = new Set<string>();

  for (const rel of relations) {
    const target = rel.target;

    if (existingModels.includes(target) || createdModels.has(target)) {
      finalRelations.push(rel);
      continue;
    }

    log.error(`Model "${target}" not found.`);

    const { action } = await inquirer.prompt([
      {
        type: "select",
        name: "action",
        message: "What do you want to do?",
        choices: ["Create Model", "Skip Relation"],
      },
    ]);

    if (action === "Create Model") {
      let modelFields: Field[] = [];
      if (inputMode === "quick") {
        const { fieldInput } = await fieldInputs();
        modelFields = await parseFields(fieldInput);
      } else {
        await addField(modelFields);
      }
      await createModelFile(target, basePath, db, isESM, modelFields);
      createdModels.add(target);
      finalRelations.push(rel);
    } else {
      log.warn(`Skipping relation with ${target}`);
    }
  }

  return finalRelations;
}

async function createModelFile(
  modelName: string,
  basePath: string,
  db: "mongodb" | "mssql" | "mysql",
  isESM: boolean,
  modelFields: Field[] = [],
) {
  const modelPath = path.join(basePath, "src/models", `${modelName}.model.js`);

  // prevent overwrite
  if (fs.existsSync(modelPath)) {
    log.warn(`Model ${modelName} already exists`);
    return;
  }

  let content = "";

  if (db === "mongodb") {
    content = generateMongooseModel(modelFields, modelName, isESM, []);
  } else {
    content = generateSequelizeModel(modelFields, modelName, isESM, []);
  }

  await fs.writeFile(modelPath, content);
  log.success(`Model ${modelName} created`);
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
