import { Field } from "../types/field";
import Table from "cli-table3";
import chalk from "chalk";
import { getTypeColor, getExtraInfo } from "./getTypeColor";

export function showTablePreview(fields: Field[]) {
  const table = new Table({
    head: [
      chalk.cyan("#"),
      chalk.cyan("Field"),
      chalk.cyan("Type"),
      chalk.cyan("Req"),
      chalk.cyan("Uniq"),
      chalk.cyan("Default"),
      chalk.cyan("Extra"),
    ],
    style: { head: [], border: [] },
  });

  fields.forEach((f, index) => {
    table.push([
      chalk.yellow(index + 1),
      chalk.white.bold(f.name),
      getTypeColor(f.type),
      f.required ? chalk.green("✔") : chalk.gray("✖"),
      f.unique ? chalk.green("✔") : chalk.gray("✖"),
      f.default ? chalk.magenta(f.default) : chalk.gray("-"),
      getExtraInfo(f),
    ]);
  });

  console.log("\n" + chalk.bold("📊 Schema Preview") + "\n");
  console.log(table.toString());
}
