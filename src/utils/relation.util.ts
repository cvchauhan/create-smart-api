import { fieldInputs, validateName } from "./field.validation.util";
import { log } from "../helper";
import path from "path";
import Field from "../types/field";
import { addField, parseFields } from "./field.util";
import { generateMongooseModel, generateSequelizeModel } from "./model.util";
import Relation from "../types/relation";
import { existsSync, readdirSync } from "fs";
import { writeFile } from "fs/promises";

import { select, confirm, text } from "@clack/prompts";
import { handleCancel } from "./prompt.util";

class Relations {
  askRelations = async () => {
    const relations: Relation[] = [];

    const hasRelations = handleCancel(
      await confirm({
        message: "Do you want to add relations?",
        initialValue: false,
      }),
    );

    if (!hasRelations) return relations;

    let addMore = true;

    while (addMore) {
      const type = handleCancel(
        await select({
          message: "Relation type",
          options: [
            { label: "1:1", value: "1:1" },
            { label: "1:N", value: "1:N" },
            { label: "N:N", value: "N:N" },
          ],
        }),
      );

      const target = handleCancel(
        await text({
          message: "Target model name",
          validate: validateName as any,
        }),
      );

      const field: any = handleCancel(
        await text({
          message: "Field name for relation (e.g. roleId):",
          validate: validateName as any,
        }),
      );

      const required = handleCancel(
        await confirm({
          message: "Is this relation required?",
          initialValue: false,
        }),
      );

      // 🔥 duplicate check
      if (this.isDuplicateField(field as string, relations)) {
        log.error(`Field "${field}" already used in another relation`);
        continue;
      }

      relations.push({
        type: type as "1:1" | "1:N" | "N:N",
        target: this.formatTarget(target as string),
        field: (field as string)?.trim() || "",
        required: required as boolean,
      });

      const more = handleCancel(
        await confirm({
          message: "Add another relation?",
          initialValue: false,
        }),
      );

      addMore = more as boolean;
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
      existsSync(modelsPath)
        ? readdirSync(modelsPath)
            .filter((f) => /\.model\.(js|ts)$/.test(f))
            .map((f) => normalize(f.replace(/\.model\.(js|ts)$/, "")))
        : [],
    );

    for (const rel of relations) {
      const target = rel.target;
      const targetName = normalize(target);

      if (existingModels.has(targetName) || createdModels.has(targetName)) {
        finalRelations.push(rel);
        log.warn(`Relation with ${target} already exists`);
        continue;
      }

      log.error(`Model "${target}" not found.`);

      const action = handleCancel(
        await select({
          message: "What do you want to do?",
          options: [
            { label: "Create Model", value: "create" },
            { label: "Skip Relation", value: "skip" },
          ],
        }),
      );

      if (action === "create") {
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

    if (existsSync(modelPath)) {
      log.warn(`Model ${modelName} already exists`);
      return;
    }

    let content = "";

    if (db === "mongodb") {
      content = generateMongooseModel(modelFields, modelName, isESM, []);
    } else {
      content = generateSequelizeModel(modelFields, modelName, isESM, []);
    }

    await writeFile(modelPath, content);

    log.success(`Related model "${modelName}" created successfully!`);
  };
  isDuplicateField = (field: string, relations: Relation[]) => {
    if (!field) return false;

    const f = field.trim().toLowerCase();

    return relations.some((r) => r.field && r.field.trim().toLowerCase() === f);
  };

  formatTarget = (target?: string) => {
    const t = target?.trim();

    if (!t) return "";

    return t.charAt(0).toUpperCase() + t.slice(1);
  };
}

const relations = new Relations();
export const askRelations = relations.askRelations.bind(relations);
export const processRelations = relations.processRelations.bind(relations);
