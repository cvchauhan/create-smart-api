import { closest } from "fastest-levenshtein";
import { handleCancel } from "../utils/prompt.util";

export async function resolveType(type: string): Promise<string> {
  const allowedTypes = ["string", "number", "boolean", "date", "enum"];
  const cleanType = type.toLowerCase().trim();

  if (allowedTypes.includes(cleanType)) return cleanType;

  const suggestion = closest(cleanType, allowedTypes);
  const { confirm } = require("@clack/prompts");
  const confirmType = handleCancel(
    await confirm({
      message: `Invalid type "${type}". Did you mean "${suggestion}"?`,
      initialValue: true,
    }),
  );

  if (confirmType) return suggestion;
  const { select } = require("@clack/prompts");
  const manual = handleCancel(
    await select({
      message: "Select correct type:",
      options: allowedTypes.map((v) => ({
        label: v,
        value: v,
      })),
    }),
  );

  return manual as string;
}
