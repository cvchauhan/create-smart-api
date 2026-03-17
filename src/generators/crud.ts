import fs from "fs-extra";
import path from "path";
import { log } from "../helper/chalk";
import inquirer from "inquirer";

export default async function generateCrud(
  base: string,
  moduleName: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  if (!moduleName) {
    log.error("Module name is required");
    return;
  }
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
      when: () => !framework,
    },
    {
      type: "list",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
      when: () => !moduleType,
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
  const modelPath = path.join(base, "src/models", `${name}.model.js`);
  const routePath = path.join(base, "src/routes", `${name}.routes.js`);
  const routesIndex = path.join(base, "src/routes/index.js");

  /* -------- MODEL -------- */

  const modelContent = isESM
    ? `export const ${name}Model = {};`
    : `module.exports = {};`;

  await fs.writeFile(modelPath, modelContent);

  /* -------- SERVICE -------- */

  const serviceContent = isESM
    ? `
export const getAll = async ()=>{
 return [];
};

export const create = async (data)=>{
 return data;
};
`
    : `
module.exports.getAll = async ()=>{
 return [];
};

module.exports.create = async (data)=>{
 return data;
};
`;

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
  log.success(`CRUD for ${name} created successfully`);
}
