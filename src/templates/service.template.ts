import fs from "fs-extra";
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

  if (selectedDb === "mongodb") {
    const populateFields = relations?.map((r: any) =>
      r.type === "1:N" || r.type === "N:N"
        ? `${r.target.toLowerCase()}s`
        : r.target.toLowerCase(),
    );

    serviceContent = isESM
      ? `import ${name} from "../models/${name}.model.js";

export const getAll = async () => {
  return await ${name}.find().populate(${JSON.stringify(populateFields)});
};

export const getById = async (id) => {
  return await ${name}.findById(id).populate(${JSON.stringify(populateFields)});
};

export const create = async (data) => {
  return await ${name}.create(data);
};

export const update = async (id, data) => {
  return await ${name}.findByIdAndUpdate(id, data, { new: true });
};

export const remove = async (id) => {
  return await ${name}.findByIdAndDelete(id);
};
`
      : `const ${name} = require("../models/${name}.model");

module.exports.getAll = async () => {
  return await ${name}.find().populate(${JSON.stringify(populateFields)});
};

module.exports.getById = async (id) => {
  return await ${name}.findById(id).populate(${JSON.stringify(populateFields)});
};

module.exports.create = async (data) => {
  return await ${name}.create(data);
};

module.exports.update = async (id, data) => {
  return await ${name}.findByIdAndUpdate(id, data, { new: true });
};

module.exports.remove = async (id) => {
  return await ${name}.findByIdAndDelete(id);
};
`;
  } else {
    const includeCode = relations
      ?.map((r: any) => `{ model: models.${r.target} }`)
      .join(",");

    serviceContent = isESM
      ? `import ${name} from "../models/${name}.model.js";
import * as models from "../models/index.js";

export const getAll = async () => {
  return await ${name}.findAll({
    include: [${includeCode}]
  });
};

export const getById = async (id) => {
  return await ${name}.findByPk(id, {
    include: [${includeCode}]
  });
};

export const create = async (data) => {
  return await ${name}.create(data);
};

export const update = async (id, data) => {
  const record = await ${name}.findByPk(id);
  if (!record) return null;
  return await record.update(data);
};

export const remove = async (id) => {
  const record = await ${name}.findByPk(id);
  if (!record) return null;
  await record.destroy();
  return true;
};
`
      : `const ${name} = require("../models/${name}.model");
const models = require("../models");

module.exports.getAll = async () => {
  return await ${name}.findAll({
    include: [${includeCode}]
  });
};

module.exports.getById = async (id) => {
  return await ${name}.findByPk(id, {
    include: [${includeCode}]
  });
};

module.exports.create = async (data) => {
  return await ${name}.create(data);
};

module.exports.update = async (id, data) => {
  const record = await ${name}.findByPk(id);
  if (!record) return null;
  return await record.update(data);
};

module.exports.remove = async (id) => {
  const record = await ${name}.findByPk(id);
  if (!record) return null;
  await record.destroy();
  return true;
};
`;
  }
  if (isCrud) {
    await fs.writeFile(servicePath, serviceContent);
  } else {
    await fs.writeFile(
      path.join(servicePath, `${name}.service.js`),
      serviceContent,
    );
  }
};

export default serviceGenrate;
