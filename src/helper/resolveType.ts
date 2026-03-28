import { closest } from "fastest-levenshtein";
import { prompt } from "../helper/promptAdapter";

export async function resolveType(type: string): Promise<string> {
  const allowedTypes = ["string", "number", "boolean", "date", "enum"];
  const cleanType = type.toLowerCase().trim();

  if (allowedTypes.includes(cleanType)) return cleanType;

  const suggestion = closest(cleanType, allowedTypes);

  const { confirm } = await prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Invalid type "${type}". Did you mean "${suggestion}"?`,
      default: true,
    },
  ]);

  if (confirm) return suggestion;

  const { manual } = await prompt([
    {
      type: "rawlist",
      name: "manual",
      message: "Select correct type:",
      choices: allowedTypes,
    },
  ]);

  return manual;
}
