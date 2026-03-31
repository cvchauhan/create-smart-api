import { writeFile } from "fs/promises";
import path from "path";

const serviceGenrate = async (
  selectedDb: "mongodb" | "mssql" | "mysql",
  isESM: boolean,
  relations: any[],
  name: string,
  servicePath: string,
  isCrud: boolean,
) => {
  let serviceContent = "";
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  if (selectedDb === "mongodb") {
    const populateFields = relations?.map((r: any) => r.field).filter(Boolean);
    const uniqueTargets = [...new Set(relations.map((r: any) => r.target))];

    const relationImportsESM = uniqueTargets
      .map((t) => `import  "../models/${t}.model.js";`)
      .join("\n");

    const relationImportsCJS = uniqueTargets
      .map((t) => `require("../models/${t}.model");`)
      .join("\n");

    serviceContent = isESM
      ? `${relationImportsESM}
import ${nameCapitalized} from "../models/${nameCapitalized}.model.js";

export const getAll = async () => {
  return await ${nameCapitalized}.find().populate(${JSON.stringify(
    populateFields,
  )}.map(f => ({ path: f })));
};

export const getById = async (id) => {
  return await ${nameCapitalized}.findById(id).populate(${JSON.stringify(
    populateFields,
  )}.map(f => ({ path: f })));
};

export const create = async (data) => {
  return await ${nameCapitalized}.create(data);
};

export const update = async (id, data) => {
  return await ${nameCapitalized}.findByIdAndUpdate(id, data, { new: true });
};

export const remove = async (id) => {
  return await ${nameCapitalized}.findByIdAndDelete(id);
};
`
      : `const ${nameCapitalized} = require("../models/${nameCapitalized}.model");
${relationImportsCJS}

module.exports.getAll = async () => {
  return await ${nameCapitalized}.find().populate(${JSON.stringify(
    populateFields,
  )}.map(f => ({ path: f })));
};

module.exports.getById = async (id) => {
  return await ${nameCapitalized}.findById(id).populate(${JSON.stringify(
    populateFields,
  )}.map(f => ({ path: f })));
};

module.exports.create = async (data) => {
  return await ${nameCapitalized}.create(data);
};

module.exports.update = async (id, data) => {
  return await ${nameCapitalized}.findByIdAndUpdate(id, data, { new: true });
};

module.exports.remove = async (id) => {
  return await ${nameCapitalized}.findByIdAndDelete(id);
};
`;
  } else {
    const includeCode = relations
      ?.map((r: any) => `{ model: models.${r.target} }`)
      .join(",");

    serviceContent = isESM
      ? `import ${nameCapitalized} from "../models/${nameCapitalized}.model.js";
import * as models from "../models/index.js";

export const getAll = async () => {
  return await ${nameCapitalized}.findAll({
    include: [${includeCode}]
  });
};

export const getById = async (id) => {
  return await ${nameCapitalized}.findByPk(id, {
    include: [${includeCode}]
  });
};

export const create = async (data) => {
  return await ${nameCapitalized}.create(data);
};

export const update = async (id, data) => {
  const record = await ${nameCapitalized}.findByPk(id);
  if (!record) return null;
  return await record.update(data);
};

export const remove = async (id) => {
  const record = await ${nameCapitalized}.findByPk(id);
  if (!record) return null;
  await record.destroy();
  return true;
};
`
      : `const ${nameCapitalized} = require("../models/${nameCapitalized}.model");
const models = require("../models");

module.exports.getAll = async () => {
  return await ${nameCapitalized}.findAll({
    include: [${includeCode}]
  });
};

module.exports.getById = async (id) => {
  return await ${nameCapitalized}.findByPk(id, {
    include: [${includeCode}]
  });
};

module.exports.create = async (data) => {
  return await ${nameCapitalized}.create(data);
};

module.exports.update = async (id, data) => {
  const record = await ${nameCapitalized}.findByPk(id);
  if (!record) return null;
  return await record.update(data);
};

module.exports.remove = async (id) => {
  const record = await ${nameCapitalized}.findByPk(id);
  if (!record) return null;
  await record.destroy();
  return true;
};
`;
  }
  if (isCrud) {
    await writeFile(servicePath, serviceContent);
  } else {
    await writeFile(
      path.join(servicePath, `${name}.service.js`),
      serviceContent,
    );
  }
};

export default serviceGenrate;
