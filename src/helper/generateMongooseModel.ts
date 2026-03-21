import { Field } from "../types/field";
import { generateMongooseRelations } from "./mongooseRelations";

export function generateMongooseModel(
  fields: Field[],
  name: string,
  isESM: boolean,
  relations: any[] = [],
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

  // 🔥 Generate relation fields
  const relationFields = generateMongooseRelations(relations);

  return isESM
    ? `
import mongoose from "mongoose";

const ${name}Schema = new mongoose.Schema({
${modelFields}${relationFields ? "," + relationFields : ""}
}, { timestamps: true });

export default mongoose.model("${name}", ${name}Schema);
`
    : `
const mongoose = require("mongoose");

const ${name}Schema = new mongoose.Schema({
${modelFields}${relationFields ? "," + relationFields : ""}
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
    objectid: "mongoose.Schema.Types.ObjectId",
  };

  return map[type.toLowerCase()] || type;
}
