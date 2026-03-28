import Field from "../types/field";
import pc from "picocolors";
export function getTypeColor(type: string) {
  switch (type) {
    case "string":
      return pc.blue(type);
    case "number":
      return pc.yellow(type);
    case "boolean":
      return pc.green(type);
    case "date":
      return pc.magenta(type);
    default:
      return pc.white(type);
  }
}

export function getExtraInfo(field: Field) {
  if (field.enumValues?.length) {
    return pc.cyan(`enum(${field.enumValues.join(",")})`);
  }
  return pc.gray("-");
}
