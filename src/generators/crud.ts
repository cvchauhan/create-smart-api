import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { log } from "../helper";
import generateModel from "../commands/model";
import { genrateRouter } from "../utils/router.util";

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

  const answers = await inquirer.prompt([
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

  const controllerPath = path.join(
    base,
    "src/controllers",
    `${name}.controller.js`,
  );
  const servicePath = path.join(base, "src/services", `${name}.service.js`);
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const modelPath = path.join(base, "src/models", `${modelName}.model.js`);
  const routesIndex = path.join(base, "src/routes/index.js");
  /* -------- MODEL -------- */
  const selectedDb = db || answers.db;
  const selectModuleType = moduleType || answers.moduleType;
  let { modelContent = "", relations = [] }: any = await generateModel(
    name,
    selectModuleType,
    selectedDb,
    isESM,
    true,
  );

  await fs.writeFile(modelPath, modelContent);

  /* -------- SERVICE -------- */

  let serviceContent = "";

  if (selectedDb === "mongodb") {
    const populateFields = relations.map((r: any) =>
      r.type === "1:N" || r.type === "N:N"
        ? `${r.target.toLowerCase()}s`
        : r.target.toLowerCase(),
    );

    serviceContent = isESM
      ? `import ${name} from "../models/${name}.model.js";

export const getAll = async () => {
  return await ${name}.find().populate(${JSON.stringify(populateFields)});
};

export const create = async (data) => {
  return await ${name}.create(data);
};
`
      : `const ${name} = require("../models/${name}.model");

module.exports.getAll = async () => {
  return await ${name}.find().populate(${JSON.stringify(populateFields)});
};

module.exports.create = async (data) => {
  return await ${name}.create(data);
};
`;
  } else {
    const includeCode = relations
      .map((r: any) => `{ model: models.${r.target} }`)
      .join(",");

    serviceContent = isESM
      ? `import ${name} from "../models/${name}.model.js";

export const getAll = async () => {
  return await ${name}.findAll({
    include: [${includeCode}]
  });
};

export const create = async (data) => {
  return await ${name}.create(data);
};
`
      : `const ${name} = require("../models/${name}.model");

module.exports.getAll = async () => {
  return await ${name}.findAll({
    include: [${includeCode}]
  });
};

module.exports.create = async (data) => {
  return await ${name}.create(data);
};
`;
  }

  await fs.writeFile(servicePath, serviceContent);

  /* -------- CONTROLLER -------- */

  let controllerContent;

  if (isESM) {
    controllerContent = `import * as service from "../services/${name}.service.js";

export const getAll = async (req,res)=>{
 const data = await service.getAll();
 res.json(data);
};

export const create = async (req,res)=>{
 const data = await service.create(req.body);
 res.json(data);
};
`;
  } else {
    controllerContent = `const service = require("../services/${name}.service");

module.exports.getAll = async (req,res)=>{
 const data = await service.getAll();
 res.json(data);
};

module.exports.create = async (req,res)=>{
 const data = await service.create(req.body);
 res.json(data);
};
`;
  }

  await fs.writeFile(controllerPath, controllerContent);

  /* -------- AUTO REGISTER ROUTE -------- */
  const selectedFramework = framework || answers.framework;
  await genrateRouter(name, selectedFramework, routesIndex, selectModuleType);

  if (!isCreate) {
    log.success(`CRUD for ${name} created successfully`);
  }
}
