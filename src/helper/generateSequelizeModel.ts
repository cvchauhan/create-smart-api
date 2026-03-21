import { mapType } from "./mapType";
import { Field } from "../types/field";
import { generateSequelizeRelations } from "./sequelizeRelations";

export function generateSequelizeModel(
  fields: Field[],
  name: string,
  isESM: boolean,
  relations: any[] = [], // 👈 NEW
) {
  const modelFields = fields
    .map((f) => {
      let str = `
  ${f.name}: {
    type: ${mapType(f.type)},`;

      if (f.required) str += `\n    allowNull: false,`;
      if (f.unique) str += `\n    unique: true,`;
      if (f.default) str += `\n    defaultValue: ${JSON.stringify(f.default)},`;

      if (f.enumValues) {
        str += `\n    validate: { isIn: [${JSON.stringify(f.enumValues)}] },`;
      }

      str += `\n  }`;
      return str;
    })
    .join(",");

  // 🔥 Generate relation code
  const relationCode = generateSequelizeRelations(name, relations);

  return isESM
    ? `
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ${name} = sequelize.define("${name}", {
${modelFields}
}, { timestamps: true });

// 🔥 Relations
${name}.associate = (models) => {
${relationCode}
};

export default ${name};
`
    : `
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ${name} = sequelize.define("${name}", {
${modelFields}
}, { timestamps: true });

// 🔥 Relations
${name}.associate = (models) => {
${relationCode}
};

module.exports = ${name};
`;
}
