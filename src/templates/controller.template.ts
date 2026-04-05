import { writeFile } from "fs/promises";

export default async function generateController(
  name: string,
  isESM: boolean,
  controllerPath: string,
  framework: "express" | "fastify",
) {
  // 👉 Decide handler params & response method
  const resParam = framework === "fastify" ? "reply" : "res";
  const sendMethod =
    framework === "fastify" ? `${resParam}.send` : `${resParam}.json`;

  const params = framework === "fastify" ? "(req, reply)" : "(req, res)";

  let controllerContent;

  if (isESM) {
    controllerContent = `import * as service from "../services/${name}.service.js";
    
export const getAll = async ${params} => {
    const data = await service.getAll();
    return ${sendMethod}(data);
};

export const getById = async ${params} => {
    const data = await service.getById(req.params.id);
    return ${sendMethod}(data);
};

export const create = async ${params} => {
    const data = await service.create(req.body);
    return ${sendMethod}(data);
};

export const update = async ${params} => {
    const data = await service.update(req.params.id, req.body);
    return ${sendMethod}(data);
};

export const remove = async ${params} => {
    const data = await service.remove(req.params.id);
    return ${sendMethod}({ success: true, data });
};
`;
  } else {
    controllerContent = `const service = require("../services/${name}.service");
    
module.exports.getAll = async ${params} => {
    const data = await service.getAll();
    return ${sendMethod}(data);
};

module.exports.getById = async ${params} => {
    const data = await service.getById(req.params.id);
    return ${sendMethod}(data);
};

module.exports.create = async ${params} => {
    const data = await service.create(req.body);
    return ${sendMethod}(data);
};

module.exports.update = async ${params} => {
    const data = await service.update(req.params.id, req.body);
    return ${sendMethod}(data);
};

module.exports.remove = async ${params} => {
    const data = await service.remove(req.params.id);
    return ${sendMethod}({ success: true, data });
};
`;
  }

  await writeFile(controllerPath, controllerContent);
}
