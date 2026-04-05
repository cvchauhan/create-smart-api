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
        if (f.default !== undefined) {
          const parsed = this.parseDefaultValue(f.default, f.type);

          str += `\n    defaultValue: ${
            typeof parsed === "string" ? JSON.stringify(parsed) : parsed
          },`;
        }

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
      const source = name;
      const target = r.target;

      const as = r.field || target.toLowerCase();
      const inverseAs =
        r.inverseField || source.toLowerCase() + (r.type === "1:N" ? "" : "s");

      const fk = `${source.toLowerCase()}Id`;

      if (r.type === "1:N") {
        // A hasMany B, B belongsTo A
        code += `
    ${source}.hasMany(models.${target}, { as: "${as}", foreignKey: "${fk}" });
    models.${target}.belongsTo(${source}, { as: "${inverseAs}", foreignKey: "${fk}" });`;
      }

      if (r.type === "N:1") {
        // A belongsTo B, B hasMany A
        const fk = `${target.toLowerCase()}Id`;

        code += `
    ${source}.belongsTo(models.${target}, { as: "${as}", foreignKey: "${fk}" });
    models.${target}.hasMany(${source}, { as: "${inverseAs}", foreignKey: "${fk}" });`;
      }

      if (r.type === "1:1") {
        const fk = `${source.toLowerCase()}Id`;

        code += `
    ${source}.hasOne(models.${target}, { as: "${as}", foreignKey: "${fk}" });
    models.${target}.belongsTo(${source}, { as: "${inverseAs}", foreignKey: "${fk}" });`;
      }

      if (r.type === "N:N") {
        const through = r.through || `${source}${target}`;

        code += `
    ${source}.belongsToMany(models.${target}, { as: "${as}", through: "${through}" });
    models.${target}.belongsToMany(${source}, { as: "${inverseAs}", through: "${through}" });`;
      }
    });

    return code;
  };

  generateSequelizeIndex = (isESM: boolean) => {
    if (isESM) {
      return `import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {};
const files = fs.readdirSync(__dirname).filter(file => file !== "index.js" && file.endsWith(".js"));

// Initialize models
for (const file of files) {
  const modelModule = await import(\`./\${file}\`);
  const model = modelModule.default;
  models[model.name] = model;
}

// Run associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export default models;
`;
    } else {
      return `const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const fs = require("fs");
const path = require("path");

const models = {};
const files = fs.readdirSync(__dirname).filter(file => file !== "index.js" && file.endsWith(".js"));

files.forEach((file) => {
  const model = require(path.join(__dirname, file));
  models[model.name] = model;
});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, ...models };
`;
    }
  };

  generateMongooseModel = (
    fields: Field[],
    name: string,
    isESM: boolean,
    relations: any[] = [],
  ) => {
    const schemaName = name.charAt(0).toLowerCase() + name.slice(1);

    // 🔥 Remove duplicate fields (important fix)
    const relationFieldNames = relations.map((r) =>
      r.type === "1:N" || r.type === "N:N"
        ? `${r.target.toLowerCase()}s`
        : r.target.toLowerCase(),
    );

    const filteredFields = fields.filter(
      (f) => !relationFieldNames.includes(f.name.toLowerCase()),
    );

    const modelFields = filteredFields
      .map((f) => {
        let str = `
  ${f.name}: {
    type: ${this.mapMongooseType(f.type)},`;

        if (f.required) str += `\n    required: true,`;
        if (f.unique) str += `\n    unique: true,`;
        if (f.default !== undefined) {
          const parsed = this.parseDefaultValue(f.default, f.type);

          str += `\n    default: ${
            typeof parsed === "string" ? JSON.stringify(parsed) : parsed
          },`;
        }

        if (f.enumValues) {
          str += `\n    enum: ${JSON.stringify(f.enumValues)},`;
        }

        str += `\n  }`;
        return str;
      })
      .join(",");

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
        const fieldName =
          r.field ||
          (r.type === "1:N" || r.type === "N:N"
            ? `${r.target.toLowerCase()}s`
            : r.target.toLowerCase());

        const isArray = r.type === "1:N" || r.type === "N:N";

        return `
  ${fieldName}: ${isArray ? "[" : ""}{
    type: mongoose.Schema.Types.ObjectId,
    ref: "${r.target}"
  }${isArray ? "]" : ""}`;
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
  parseDefaultValue(value: any, type: string) {
    if (value === undefined) return value;

    switch (type.toLowerCase()) {
      case "boolean":
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return true;

      case "number":
        return Number(value);

      case "string":
        return String(value);

      default:
        return value;
    }
  }
}

const model = new Model();
export const generateSequelizeModel = model.generateSequelizeModel.bind(model);
export const generateMongooseModel = model.generateMongooseModel.bind(model);
export const generateSequelizeIndex = model.generateSequelizeIndex.bind(model);
