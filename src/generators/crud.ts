import path from "node:path";
import { log } from "../helper";
import generateModel from "../commands/model";
import { genrateRouter } from "../utils/router.util";
import serviceGenrate from "../templates/service.template";
import generateController from "../templates/controller.template";
import { handleCancel } from "../utils/prompt.util";

export default async function generateCrud(
  base: string,
  moduleName: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
  db?: "mongodb" | "mssql" | "mysql",
  isCreate?: boolean,
) {
  const { select, intro, outro } = require("@clack/prompts");
  if (!moduleName) {
    log.error("Module name is required");
    return;
  }
  if (!isCreate) {
    intro("Create Smart API Crud🚀");
  }
  const answers: any = {};
  if (!framework) {
    const res = handleCancel(
      await select({
        message: "Select Framework",
        options: [
          { label: "express", value: "express" },
          { label: "fastify", value: "fastify" },
        ],
        initialValue: "express",
      }),
    );

    answers.framework = res;
  }
  if (!moduleType) {
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

    answers.moduleType = res;
  }

  if (!db) {
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

    answers.db = res;
  }

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
  const selectedFramework = framework || answers.framework;
  await generateController(name, isESM, controllerPath, selectedFramework);

  /* -------- AUTO REGISTER ROUTE -------- */
  const routesIndex = path.join(base, "src/routes/index.js");
  await genrateRouter(name, selectedFramework, routesIndex, selectModuleType);

  if (!isCreate) {
    log.success(`CRUD module "${name}" created successfully!`);
    outro("Happy coding! 🚀");
  }
}
