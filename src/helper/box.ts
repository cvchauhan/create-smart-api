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

export const box = (
  text: string,
  options?: {
    padding?: number;
    borderStyle?: "round" | "single";
  },
) => {
  const padding = options?.padding ?? 0;
  const style = options?.borderStyle ?? "round";

  const b = getBorderChars(style);

  const lines = text.split("\n");
  const width = Math.max(...lines.map((l) => l.length));

  const padLine = (line: string) => line + " ".repeat(width - line.length);

  const horizontal = b.h.repeat(width + padding * 2);

  const top = `${b.tl}${horizontal}${b.tr}`;
  const bottom = `${b.bl}${horizontal}${b.br}`;

  const emptyPad = " ".repeat(width + padding * 2);

  const padded = [
    top,
    ...Array(padding).fill(`${b.v}${emptyPad}${b.v}`),
    ...lines.map(
      (l) =>
        `${b.v}${" ".repeat(padding)}${padLine(l)}${" ".repeat(padding)}${b.v}`,
    ),
    ...Array(padding).fill(`${b.v}${emptyPad}${b.v}`),
    bottom,
  ];

  return padded.join("\n");
};

export default box;
