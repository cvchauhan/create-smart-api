import { Field } from "../types/field";

export function generateMongooseModel(
  fields: Field[],
  name: string,
  isESM: boolean,
) {
  const modelFields = fields
    .map((f) => {
      let str = `
  ${f.name}: {
    type: ${mapMongooseType(f.type)},`;

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

  return isESM
    ? `
import mongoose from "mongoose";

const ${name}Schema = new mongoose.Schema({
${modelFields}
}, { timestamps: true });

export default mongoose.model("${name}", ${name}Schema);
`
    : `
const mongoose = require("mongoose");

const ${name}Schema = new mongoose.Schema({
${modelFields}
}, { timestamps: true });

module.exports = mongoose.model("${name}", ${name}Schema);
`;
}

function mapMongooseType(type: string) {
  const map: any = {
    string: "String",
    number: "Number",
    boolean: "Boolean",
    date: "Date",
  };
  return map[type] || "String";
}
