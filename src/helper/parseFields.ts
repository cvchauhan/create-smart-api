import { Field } from "../types/field";
import { log } from "./chalk";
import { resolveType } from "./resolveType";

export async function parseFields(input: string): Promise<Field[]> {
  const fields: Field[] = [];

  if (!input) {
    return [];
  }

  for (const item of input.split(",")) {
    const [name, type] = item.split(":");

    if (!name || !type) {
      log.error(`Invalid field: ${item}`);
      return [];
    }
    const resolvedType = await resolveType(type);

    fields.push({
      name: name.trim(),
      type: resolvedType,
    });
  }

  return fields;
}
