import Field from "../types/field";

class Model {
  generateSequelizeModel = (
    fields: Field[],
    name: string,
    isESM: boolean,
    relations: any[] = [], // 👈 NEW
  ) => {
    const modelFields = fields
      .map((f) => {
        let str = `
  ${f.name}: {
    type: ${this.mapType(f.type)},`;

        if (f.required) str += `\n    allowNull: false,`;
        if (f.unique) str += `\n    unique: true,`;
        if (f.default)
          str += `\n    defaultValue: ${JSON.stringify(f.default)},`;

        if (f.enumValues) {
          str += `\n    validate: { isIn: [${JSON.stringify(f.enumValues)}] },`;
        }

        str += `\n  }`;
        return str;
      })
      .join(",");

    // 🔥 Generate relation code
    const relationCode = this.generateSequelizeRelations(name, relations);

    return isESM
      ? `import { DataTypes } from "sequelize";
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
      : `const { DataTypes } = require("sequelize");
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
  };

  generateSequelizeRelations = (name: string, relations: any[]) => {
    let code = "";

    relations.forEach((r) => {
      if (r.type === "1:N") {
        code += `
    ${name}.hasMany(models.${r.target});
    models.${r.target}.belongsTo(${name});`;
      }

      if (r.type === "1:1") {
        code += `
    ${name}.hasOne(models.${r.target});
    models.${r.target}.belongsTo(${name});`;
      }

      if (r.type === "N:N") {
        const through = `${name}${r.target}`;
        code += `
    ${name}.belongsToMany(models.${r.target}, { through: "${through}" });
    models.${r.target}.belongsToMany(${name}, { through: "${through}" });`;
      }
    });

    return code;
  };

  generateMongooseModel = (
    fields: Field[],
    name: string,
    isESM: boolean,
    relations: any[] = [],
  ) => {
    const schemaName = name.charAt(0).toLowerCase() + name.slice(1);
    const modelFields = fields
      .map((f) => {
        let str = `
  ${f.name}: {
    type: ${this.mapMongooseType(f.type)},`;

        if (f.required) str += `\n    required: true,`;
        if (f.unique) str += `\n    unique: true,`;
        if (f.default) str += `\n    default: ${JSON.stringify(f.default)},`;

        if (f.enumValues) {
          str += `\n    enum: ${JSON.stringify(f.enumValues)},`;
        }

        str += `\n  }`;
        return str;
      })
      .join(",");

    // 🔥 Generate relation fields
    const relationFields = this.generateMongooseRelations(relations);

    return isESM
      ? `import mongoose from "mongoose";

const ${schemaName}Schema = new mongoose.Schema({
${modelFields}${relationFields ? "," + relationFields : ""}
}, { timestamps: true });

export default mongoose.model("${name}", ${schemaName}Schema);
`
      : `const mongoose = require("mongoose");

const ${schemaName}Schema = new mongoose.Schema({
${modelFields}${relationFields ? "," + relationFields : ""}
}, { timestamps: true });

module.exports = mongoose.model("${name}", ${schemaName}Schema);
`;
  };

  generateMongooseRelations = (relations: any[]) => {
    return relations
      .map((r) => {
        if (r.type === "1:N" || r.type === "N:N") {
          return `
  ${r.target.toLowerCase()}s: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "${r.target}"
  }]`;
        }

        return `
  ${r.target.toLowerCase()}: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "${r.target}"
  }`;
      })
      .join(",");
  };
  mapMongooseType = (type: string) => {
    const map: any = {
      string: "String",
      number: "Number",
      boolean: "Boolean",
      date: "Date",
      objectid: "mongoose.Schema.Types.ObjectId",
    };

    return map[type.toLowerCase()] || "String";
  };
  mapType = (type: string) => {
    const map: any = {
      string: "DataTypes.STRING",
      number: "DataTypes.INTEGER",
      boolean: "DataTypes.BOOLEAN",
      date: "DataTypes.DATE",
    };
    return map[type] || "DataTypes.STRING";
  };
}

const model = new Model();
export const generateSequelizeModel = model.generateSequelizeModel.bind(model);
export const generateMongooseModel = model.generateMongooseModel.bind(model);
