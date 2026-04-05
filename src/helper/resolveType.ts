import { closest } from "fastest-levenshtein";
import { confirm, select } from "@clack/prompts";
import { handleCancel } from "../utils/prompt.util";

export async function resolveType(type: string): Promise<string> {
  const allowedTypes = ["string", "number", "boolean", "date", "enum"];
  const cleanType = type.toLowerCase().trim();

  if (allowedTypes.includes(cleanType)) return cleanType;

  const suggestion = closest(cleanType, allowedTypes);

  const confirmType = handleCancel(
    await confirm({
      message: `Invalid type "${type}". Did you mean "${suggestion}"?`,
      initialValue: true,
    }),
  );

  if (confirmType) return suggestion;

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
