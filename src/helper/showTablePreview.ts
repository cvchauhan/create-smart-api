import Field from "../types/field";
import Table from "cli-table3";
import pc from "picocolors";

class TablePreview {
  showTablePreview = (fields: Field[]) => {
    const table = new Table({
      head: [
        pc.cyan("#"),
        pc.cyan("Field"),
        pc.cyan("Type"),
        pc.cyan("Req"),
        pc.cyan("Uniq"),
        pc.cyan("Default"),
        pc.cyan("Extra"),
      ],
      style: { head: [], border: [] },
    });

    fields.forEach((f, index) => {
      table.push([
        pc.yellow(index + 1),
        pc.bold(pc.white(f.name)),
        this.getTypeColor(f.type),
        f.required ? pc.green("✔") : pc.gray("✖"),
        f.unique ? pc.green("✔") : pc.gray("✖"),
        f.default ? pc.magenta(f.default) : pc.gray("-"),
        this.getExtraInfo(f),
      ]);
    });

    console.log("\n" + pc.bold("📊 Schema Preview") + "\n");
    console.log(table.toString());
  };

  getTypeColor(type: string) {
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
  getExtraInfo = (field: Field) => {
    if (field.enumValues?.length) {
      return pc.cyan(`enum(${field.enumValues.join(",")})`);
    }
    return pc.gray("-");
  };
}

const tablePreview = new TablePreview();
export const showTablePreview =
  tablePreview.showTablePreview.bind(tablePreview);
