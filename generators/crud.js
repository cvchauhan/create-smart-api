import fs from "fs-extra";
import path from "path";

export default async function generateCrud(
  base,
  moduleName,
  framework,
  moduleType,
) {
  const name = moduleName.toLowerCase();
  const isESM = moduleType === "module";

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
exports.getAll = async ()=>{
 return [];
};

exports.create = async (data)=>{
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

exports.getAll = async (req,res)=>{
 const data = await service.getAll();
 res.json(data);
};

exports.create = async (req,res)=>{
 const data = await service.create(req.body);
 res.json(data);
};
`;
  }

  await fs.writeFile(controllerPath, controllerContent);

  /* -------- ROUTES -------- */

  let routeContent;

  if (framework === "express") {
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

  if (framework === "fastify") {
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

  let registerCode = "";

  if (framework === "express") {
    registerCode = isESM
      ? `
export default function registerRoutes(app) {
    import ${name}Routes from "./${name}.routes.js";
    app.use("/${name}s", ${name}Routes); 
}
`
      : `
module.exports = function registerRoutes(app) { 
    const ${name}Routes = require("./${name}.routes");
    app.use("/${name}s", ${name}Routes);
}
`;
  }

  if (framework === "fastify") {
    registerCode = isESM
      ? `
export default async function registerRoutes(app) {
    import ${name}Routes from "./${name}.routes.js";
    await app.register(${name}Routes);
}
`
      : `
module.exports = async function registerRoutes(app) {
    const ${name}Routes = require("./${name}.routes");
    await app.register(${name}Routes);
}
`;
  }

  await fs.appendFile(routesIndex, registerCode);
}
