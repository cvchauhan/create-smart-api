import Field from "../types/field";
import Table from "cli-table3";
import pc from "picocolors";

class TablePreview {
  showTablePreview = (fields: Field[]) => {
    this.showSummary(fields);
    const table = new Table({
      head: this.getHeader(),
      style: this.getTableStyle(),
      colWidths: [5, 22, 14, 6, 6, 14, 22],
      wordWrap: true,
      chars: this.getTableChars(),
    });

    fields.forEach((f, index) => {
      const isEven = index % 2 === 0;

      table.push(this.getRow(f, index, isEven));
    });

    console.log("\n" + pc.bold(pc.cyan("📊 Schema Preview")) + "\n");
    console.log(table.toString());
    console.log();
  };

  /* ---------------- HEADER ---------------- */

  private getHeader() {
    return [
      pc.bold(pc.cyan("#")),
      pc.bold(pc.cyan("Field")),
      pc.bold(pc.cyan("Type")),
      pc.bold(pc.cyan("Req")),
      pc.bold(pc.cyan("Uniq")),
      pc.bold(pc.cyan("Default")),
      pc.bold(pc.cyan("Extra")),
    ];
  }

  /* ---------------- ROW ---------------- */

  private getRow(f: Field, index: number, isEven: boolean) {
    const bg = (text: string) => (isEven ? pc.white(text) : pc.gray(text));

    return [
      bg(pc.yellow(String(index + 1))),
      pc.bold(f.name),
      this.getTypeColor(f.type),
      f.required ? pc.green("✔") : pc.gray("✖"),
      f.unique ? pc.green("✔") : pc.gray("✖"),
      f.default ? pc.magenta(String(f.default)) : pc.gray("-"),
      this.getExtraInfo(f),
    ];
  }

  /* ---------------- STYLE ---------------- */

  private getTableStyle() {
    return {
      head: [],
      border: [],
      compact: false,
    };
  }

  private getTableChars() {
    return {
      top: "─",
      "top-mid": "┬",
      "top-left": "╭",
      "top-right": "╮",
      bottom: "─",
      "bottom-mid": "┴",
      "bottom-left": "╰",
      "bottom-right": "╯",
      left: "│",
      "left-mid": "├",
      mid: "─",
      "mid-mid": "┼",
      right: "│",
      "right-mid": "┤",
      middle: "│",
    };
  }

  /* ---------------- TYPE COLOR ---------------- */

  private getTypeColor(type: string) {
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

  /* ---------------- EXTRA INFO ---------------- */

  private getExtraInfo(field: Field) {
    if (field.enumValues?.length) {
      return pc.cyan(`enum(${field.enumValues.join(", ")})`);
    }
    return pc.gray("-");
  }
  private showSummary(fields: Field[]) {
    const total = fields.length;
    const required = fields.filter((f) => f.required).length;
    const unique = fields.filter((f) => f.unique).length;
    const optional = total - required;
    const enums = fields.filter((f) => f.enumValues?.length).length;

    console.log("\n" + pc.bold(pc.cyan("📊 Schema Preview")) + "\n");

    console.log(`${pc.yellow("Total Fields")}   : ${pc.white(total)}`);
    console.log(`${pc.green("Required")}       : ${pc.white(required)}`);
    console.log(`${pc.blue("Unique")}         : ${pc.white(unique)}`);
    console.log(`${pc.gray("Optional")}       : ${pc.white(optional)}`);
    console.log(`${pc.magenta("Enums")}          : ${pc.white(enums)}\n`);
  }
}

const tablePreview = new TablePreview();

export const showTablePreview =
  tablePreview.showTablePreview.bind(tablePreview);
