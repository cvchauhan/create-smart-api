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
      const fk = `${r.target.toLowerCase()}Id`;

      if (r.type === "1:N") {
        code += `
    ${name}.hasMany(models.${r.target}, { foreignKey: "${fk}" });
    models.${r.target}.belongsTo(${name}, { foreignKey: "${fk}" });`;
      }

      if (r.type === "1:1") {
        code += `
    ${name}.hasOne(models.${r.target}, { foreignKey: "${fk}" });
    models.${r.target}.belongsTo(${name}, { foreignKey: "${fk}" });`;
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

        if (r.type === "1:N" || r.type === "N:N") {
          return `
  ${fieldName}: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "${r.target}"
  }]`;
        }

        return `
  ${fieldName}: {
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
  parseDefaultValue(value: any, type: string) {
    if (value === undefined) return value;

    switch (type.toLowerCase()) {
      case "boolean":
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return undefined;

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
