import Field from "../types/field";
import chalk from "chalk";
export function getTypeColor(type: string) {
  switch (type) {
    case "string":
      return chalk.blue(type);
    case "number":
      return chalk.yellow(type);
    case "boolean":
      return chalk.green(type);
    case "date":
      return chalk.magenta(type);
    default:
      return chalk.white(type);
  }
}

export function getExtraInfo(field: Field) {
  if (field.enumValues?.length) {
    return chalk.cyan(`enum(${field.enumValues.join(",")})`);
  }
  return chalk.gray("-");
}
