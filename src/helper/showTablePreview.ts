import Field from "../types/field";
import pc from "picocolors";

class TablePreview {
  showTablePreview = (fields: Field[]) => {
    this.showSummary(fields);

    const headers = ["#", "Field", "Type", "Req", "Uniq", "Default", "Extra"];

    const rows = fields.map((f, index) => [
      String(index + 1),
      f.name,
      f.type,
      f.required ? "✔" : "✖",
      f.unique ? "✔" : "✖",
      f.default ? String(f.default) : "-",
      f.enumValues?.length ? `enum(${f.enumValues.join(", ")})` : "-",
    ]);

    console.log("\n" + pc.bold(pc.cyan("📊 Schema Preview")) + "\n");

    this.printTable(headers, rows);

    console.log();
  };

  /* ---------------- SIMPLE TABLE ---------------- */

  private printTable(headers: string[], rows: string[][]) {
    const allRows = [headers, ...rows];

    // calculate column widths
    const colWidths = headers.map((_, colIndex) =>
      Math.max(...allRows.map((row) => (row[colIndex] || "").length)),
    );

    const pad = (text: string, width: number) =>
      text + " ".repeat(width - text.length);

    const drawLine = (left: string, mid: string, right: string) => {
      const line = colWidths.map((w) => "─".repeat(w + 2)).join(mid);
      console.log(left + line + right);
    };

    // top border
    drawLine("╭", "┬", "╮");

    // header
    const headerRow = headers
      .map((h, i) => " " + pc.bold(pc.cyan(pad(h, colWidths[i]))) + " ")
      .join("│");
    console.log("│" + headerRow + "│");

    // separator
    drawLine("├", "┼", "┤");

    // rows
    rows.forEach((row, index) => {
      const isEven = index % 2 === 0;

      const line = row
        .map((cell, i) => {
          let value = pad(cell, colWidths[i]);

          // coloring
          if (i === 0) value = pc.yellow(value);
          if (i === 2) value = this.getTypeColor(value);
          if (i === 3 || i === 4)
            value = cell === "✔" ? pc.green(value) : pc.gray(value);
          if (i === 5 && cell !== "-") value = pc.magenta(value);
          if (i === 6 && cell.startsWith("enum")) value = pc.cyan(value);

          return " " + (isEven ? pc.white(value) : pc.gray(value)) + " ";
        })
        .join("│");

      console.log("│" + line + "│");
    });

    // bottom border
    drawLine("╰", "┴", "╯");
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

  /* ---------------- SUMMARY ---------------- */

  private showSummary(fields: Field[]) {
    const total = fields.length;
    const required = fields.filter((f) => f.required).length;
    const unique = fields.filter((f) => f.unique).length;
    const optional = total - required;
    const enums = fields.filter((f) => f.enumValues?.length).length;

    console.log("\n" + pc.bold(pc.cyan("📊 Schema Summary")) + "\n");

    console.log(`${pc.yellow("Total Fields")} : ${pc.white(total)}`);
    console.log(`${pc.green("Required")}     : ${pc.white(required)}`);
    console.log(`${pc.blue("Unique")}       : ${pc.white(unique)}`);
    console.log(`${pc.gray("Optional")}     : ${pc.white(optional)}`);
    console.log(`${pc.magenta("Enums")}     : ${pc.white(enums)}\n`);
  }
}

const tablePreview = new TablePreview();

export const showTablePreview =
  tablePreview.showTablePreview.bind(tablePreview);
