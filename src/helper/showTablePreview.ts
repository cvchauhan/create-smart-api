import Field from "../types/field";
import Table from "cli-table3";
import chalk from "chalk";

class TablePreview {
  showTablePreview = (fields: Field[]) => {
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
        this.getTypeColor(f.type),
        f.required ? chalk.green("✔") : chalk.gray("✖"),
        f.unique ? chalk.green("✔") : chalk.gray("✖"),
        f.default ? chalk.magenta(f.default) : chalk.gray("-"),
        this.getExtraInfo(f),
      ]);
    });

    console.log("\n" + chalk.bold("📊 Schema Preview") + "\n");
    console.log(table.toString());
  };

  getTypeColor(type: string) {
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
  getExtraInfo = (field: Field) => {
    if (field.enumValues?.length) {
      return chalk.cyan(`enum(${field.enumValues.join(",")})`);
    }
    return chalk.gray("-");
  };
}

const tablePreview = new TablePreview();
export const showTablePreview =
  tablePreview.showTablePreview.bind(tablePreview);
