import stripAnsi from "strip-ansi";

const getBorderChars = (style: "round" | "single") => {
  if (style === "round") {
    return {
      tl: "╭",
      tr: "╮",
      bl: "╰",
      br: "╯",
      h: "─",
      v: "│",
    };
  }

  return {
    tl: "+",
    tr: "+",
    bl: "+",
    br: "+",
    h: "-",
    v: "|",
  };
};

const visibleLength = (str: string) => stripAnsi(str).length;

export const box = (
  text: string,
  options?: {
    padding?: number;
    borderStyle?: "round" | "single";
    minWidth?: number;
  },
) => {
  const padding = options?.padding ?? 1;
  const style = options?.borderStyle ?? "round";

  const b = getBorderChars(style);

  const rawLines = text.split("\n");

  const width = Math.max(
    options?.minWidth ?? 0,
    ...rawLines.map((l) => visibleLength(l)),
  );

  const padRight = (line: string) =>
    line + " ".repeat(width - visibleLength(line));

  const horizontal = b.h.repeat(width + padding * 2);

  const top = `${b.tl}${horizontal}${b.tr}`;
  const bottom = `${b.bl}${horizontal}${b.br}`;

  const emptyLine = `${b.v}${" ".repeat(width + padding * 2)}${b.v}`;

  const contentLines = rawLines.map((line) => {
    const clean = padRight(line);
    return `${b.v}${" ".repeat(padding)}${clean}${" ".repeat(padding)}${b.v}`;
  });

  return [
    top,
    ...Array(padding).fill(emptyLine),
    ...contentLines,
    ...Array(padding).fill(emptyLine),
    bottom,
  ].join("\n");
};

export default box;
