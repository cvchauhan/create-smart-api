import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { parseFields, log, askRelations } from "../helper";
import generateModel from "../commands/model";

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
  const routePath = path.join(base, "src/routes", `${name}.routes.js`);
  const routesIndex = path.join(base, "src/routes/index.js");

  const { fieldInput } = await inquirer.prompt({
    type: "input",
    name: "fieldInput",
    required: true,
    message:
      "Enter fields (e.g. name:string,email:string,age:number,status:enum)",
  });

  const fields = await parseFields(fieldInput);
  if (!fields.length) {
    log.warn(`Project created successfully, but no models were generated.

      Some features like database operations may not work.

      👉 Run again to add models (create-smart-api create).
`);
    return;
  }

  /* -------- MODEL -------- */
  const selectedDb = db || answers.db;
  const selectModuleType = moduleType || answers.moduleType;
  let modelContent: any = await generateModel(
    name,
    selectModuleType,
    selectedDb,
    fields,
    isESM,
    true,
  );

  const relations = await askRelations();
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
      ? `
import ${name} from "../models/${name}.model.js";

export const getAll = async () => {
  return await ${name}.find().populate(${JSON.stringify(populateFields)});
};

export const create = async (data) => {
  return await ${name}.create(data);
};
`
      : `
const ${name} = require("../models/${name}.model");

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
      ? `
import models from "../models/index.js";

export const getAll = async () => {
  return await models.${name}.findAll({
    include: [${includeCode}]
  });
};

export const create = async (data) => {
  return await models.${name}.create(data);
};
`
      : `
const models = require("../models");

module.exports.getAll = async () => {
  return await models.${name}.findAll({
    include: [${includeCode}]
  });
};

module.exports.create = async (data) => {
  return await models.${name}.create(data);
};
`;
  }

  await fs.writeFile(servicePath, serviceContent);

  /* -------- CONTROLLER -------- */

  let controllerContent;

  if (isESM) {
    controllerContent = `
import * as service from "../services/${name}.service.js";

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
    controllerContent = `
const service = require("../services/${name}.service");

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

  /* -------- ROUTES -------- */

  let routeContent: any;

  if (framework === "express" || answers.framework === "express") {
    routeContent = isESM
      ? `
import express from "express";
import * as controller from "../controllers/${name}.controller.js";

const router = express.Router();

router.get("/", controller.getAll);
router.post("/", controller.create);

export default router;
`
      : `
const express = require("express");
const controller = require("../controllers/${name}.controller");

const router = express.Router();

router.get("/", controller.getAll);
router.post("/", controller.create);

module.exports = router;
`;
  }

  if (framework === "fastify" || answers.framework === "fastify") {
    routeContent = isESM
      ? `
export default async function (fastify){

 fastify.get("/${name}s", async ()=>{
  return [];
 });

 fastify.post("/${name}s", async (req)=>{
  return req.body;
 });

}
`
      : `
module.exports = async function (fastify){

 fastify.get("/${name}s", async ()=>{
  return [];
 });

 fastify.post("/${name}s", async (req)=>{
  return req.body;
 });

};
`;
  }

  await fs.writeFile(routePath, routeContent);

  /* -------- AUTO REGISTER ROUTE -------- */
  const routesDir = path.dirname(routesIndex);

  // Rebuild routes index to include all generated route modules (idempotent)
  const routeFiles = (await fs.readdir(routesDir)).filter(
    (f) => f.endsWith(".routes.js") && f !== "index.js",
  );

  const importLines = [];
  const registerLines = [];

  for (const file of routeFiles) {
    const moduleName = file.replace(".routes.js", "");
    const routeVarName = `${moduleName}Routes`;

    if (framework === "express" || answers.framework === "express") {
      if (isESM) {
        importLines.push(`import ${routeVarName} from "./${file}";`);
        registerLines.push(`  app.use("/${moduleName}s", ${routeVarName});`);
      } else {
        importLines.push(`const ${routeVarName} = require("./${file}");`);
        registerLines.push(`  app.use("/${moduleName}s", ${routeVarName});`);
      }
    }

    if (framework === "fastify" || answers.framework === "fastify") {
      if (isESM) {
        importLines.push(`import ${routeVarName} from "./${file}";`);
        registerLines.push(`  await app.register(${routeVarName});`);
      } else {
        importLines.push(`const ${routeVarName} = require("./${file}");`);
        registerLines.push(`  await app.register(${routeVarName});`);
      }
    }
  }

  let routesIndexContent = "";

  if (framework === "express" || answers.framework === "express") {
    if (isESM) {
      routesIndexContent = `${importLines.join("\n")}

export default function registerRoutes(app) {
${registerLines.join("\n")}
}
`;
    } else {
      routesIndexContent = `${importLines.join("\n")}

module.exports = function registerRoutes(app) {
${registerLines.join("\n")}
};
`;
    }
  }

  if (framework === "fastify" || answers.framework === "fastify") {
    if (isESM) {
      routesIndexContent = `${importLines.join("\n")}

export default async function registerRoutes(app) {
${registerLines.join("\n")}
}
`;
    } else {
      routesIndexContent = `${importLines.join("\n")}

module.exports = async function registerRoutes(app) {
${registerLines.join("\n")}
};
`;
    }
  }

  await fs.writeFile(routesIndex, routesIndexContent);
  if (!isCreate) {
    log.success(`CRUD for ${name} created successfully`);
  }
}
