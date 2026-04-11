import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

export async function saveProjectConfig(base: string, data: any) {
  const configPath = path.join(base, ".smart-api.json");

  let existing: any = {};

  try {
    const file = await readFile(configPath, "utf-8");
    existing = JSON.parse(file);
  } catch {}

  // ✅ ONLY allow these keys
  const cleanData = {
    module: existing.module || data.module,
    db: existing.db || data.db,
    framework: existing.framework || data.framework,
  };

  await writeFile(configPath, JSON.stringify(cleanData, null, 2));
}
