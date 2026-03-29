import { writeFile } from "fs/promises";

export default async function generateController(
  name: string,
  isESM: boolean,
  controllerPath: string,
) {
  let controllerContent;

  if (isESM) {
    controllerContent = `import * as service from "../services/${name}.service.js";
    
export const getAll = async (req, res) => {
    const data = await service.getAll();
    res.json(data);
};

export const getById = async (req, res) => {
    const data = await service.getById(req.params.id);
    res.json(data);
};

export const create = async (req, res) => {
    const data = await service.create(req.body);
    res.json(data);
};

export const update = async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
};

export const remove = async (req, res) => {
    const data = await service.remove(req.params.id);
    res.json({ success: true, data });
};
    `;
  } else {
    controllerContent = `const service = require("../services/${name}.service");
    
module.exports.getAll = async (req, res) => {
    const data = await service.getAll();
    res.json(data);
};

module.exports.getById = async (req, res) => {
    const data = await service.getById(req.params.id);
    res.json(data);
};

module.exports.create = async (req, res) => {
    const data = await service.create(req.body);
    res.json(data);
};

module.exports.update = async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
};

module.exports.remove = async (req, res) => {
    const data = await service.remove(req.params.id);
    res.json({ success: true, data });
};
    `;
  }

  await writeFile(controllerPath, controllerContent);
}
