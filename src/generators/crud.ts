import fs from "fs-extra";
import path from "path";
import { prompt } from "../helper/promptAdapter";
import { log } from "../helper";
import generateModel from "../commands/model";
import { genrateRouter } from "../utils/router.util";
import serviceGenrate from "../templates/service.template";
import generateController from "../templates/controller.template";

export default async function generateCrud(
  base: string,
  moduleName: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
  db?: "mongodb" | "mssql" | "mysql",
  isCreate?: boolean,
) {
  if (!moduleName) {
    log.error("Module name is required");
    return;
  }

  const answers = await prompt([
    {
      type: "select",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
      when: () => !framework,
    },
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
  const name = moduleName.toLowerCase();
  const isESM = moduleType === "module" || answers.moduleType === "module";
  /* -------- MODEL -------- */
  const selectedDb = db || answers.db;
  const selectModuleType = moduleType || answers.moduleType;
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const modelPath = path.join(base, "src/models", `${modelName}.model.js`);
  const relations = await generateModel(
    name,
    selectModuleType,
    selectedDb,
    isESM,
    true,
    modelPath,
  );

  /* -------- SERVICE -------- */
  const servicePath = path.join(base, "src/services", `${name}.service.js`);
  await serviceGenrate(selectedDb, isESM, relations, name, servicePath, true);

  /* -------- CONTROLLER -------- */
  const controllerPath = path.join(
    base,
    "src/controllers",
    `${name}.controller.js`,
  );
  await generateController(name, isESM, controllerPath);

  /* -------- AUTO REGISTER ROUTE -------- */
  const selectedFramework = framework || answers.framework;
  const routesIndex = path.join(base, "src/routes/index.js");
  await genrateRouter(name, selectedFramework, routesIndex, selectModuleType);

  if (!isCreate) {
    log.success(`CRUD for ${name} created successfully`);
  }
}
