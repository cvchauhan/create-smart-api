import inquirer from "inquirer";
import { fieldInputs, validateName } from "./field.validation.util";
import { log } from "../helper";
import fs from "fs-extra";
import path from "path";
import Field from "../types/field";
import { addField, parseFields } from "./field.util";
import { generateMongooseModel, generateSequelizeModel } from "./model.util";
import Relation from "../types/relation";

class Relations {
  askRelations = async () => {
    const relations: Relation[] = [];

    const { hasRelations } = await inquirer.prompt({
      type: "confirm",
      name: "hasRelations",
      message: "Do you want to add relations?",
      default: false,
    });

    if (!hasRelations) return relations;

    let addMore = true;

    while (addMore) {
      const ans = await inquirer.prompt([
        {
          type: "select",
          name: "type",
          message: "Relation type",
          choices: ["1:1", "1:N", "N:N"],
        },
        {
          type: "input",
          name: "target",
          message: "Target model name",
          validate: validateName,
        },
        {
          type: "input",
          name: "field",
          message: "Field name for relation (e.g. roleId):",
          validate: validateName,
          filter: (val: string) => val.trim(),
        },
        {
          type: "confirm",
          name: "required",
          message: "Is this relation required?",
          default: false,
        },
      ]);
      if (
        relations.some(
          (r: any) => r.field.toLowerCase() === ans.field.toLowerCase(),
        )
      ) {
        log.error(`Field "${ans.field}" already used in another relation`);
        continue;
      }
      relations.push({
        type: ans.type,
        target: ans.target.charAt(0).toUpperCase() + ans.target.slice(1),
        field: ans.field,
        required: ans.required,
      });

      const { more } = await inquirer.prompt({
        type: "confirm",
        name: "more",
        message: "Add another relation?",
        default: false,
      });

      addMore = more;
    }

    return relations;
  };
  processRelations = async (
    relations: any[],
    basePath: string,
    db: "mongodb" | "mssql" | "mysql",
    isESM: boolean,
    inputMode: "interactive" | "quick",
  ) => {
    const modelsPath = path.join(basePath, "src/models");
    const finalRelations: any[] = [];
    const createdModels = new Set<string>();
    const normalize = (str: string) => str.toLowerCase();

    const existingModels = new Set(
      fs.existsSync(modelsPath)
        ? fs
            .readdirSync(modelsPath)
            .filter((f) => /\.model\.(js|ts)$/.test(f))
            .map((f) => normalize(f.replace(/\.model\.(js|ts)$/, "")))
        : [],
    );
    for (const rel of relations) {
      const target = rel.target;

      const targetName = normalize(rel.target);

      if (existingModels.has(targetName) || createdModels.has(targetName)) {
        finalRelations.push(rel);
        log.warn(`Relation with ${target} already exists`);
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
        await this.createModelFile(target, basePath, db, isESM, modelFields);
        createdModels.add(target);
        finalRelations.push(rel);
      } else {
        log.warn(`Skipping relation with ${target}`);
      }
    }

    return finalRelations;
  };
  createModelFile = async (
    modelName: string,
    basePath: string,
    db: "mongodb" | "mssql" | "mysql",
    isESM: boolean,
    modelFields: Field[] = [],
  ) => {
    const modelPath = path.join(
      basePath,
      "src/models",
      `${modelName}.model.js`,
    );

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
  };
}

const relations = new Relations();
export const askRelations = relations.askRelations.bind(relations);
export const processRelations = relations.processRelations.bind(relations);
