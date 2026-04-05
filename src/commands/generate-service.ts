import path from "path";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import serviceGenrate from "../templates/service.template";
import generateModel from "./model";
import { mkdir } from "fs/promises";

import { intro, outro, select } from "@clack/prompts";
import { handleCancel } from "../utils/prompt.util";

export default async function (
  name: string,
  moduleType?: "module" | "commonjs",
) {
  if (!name) {
    log.error("Service name is required");
    return;
  }
  intro("Create Smart API Service 🚀");
  const base = process.cwd();
  const config = getConfig(base);

  let selectedDb = config?.db;
  let selectedModuleType = moduleType || config?.module;

  // ✅ Ask DB if not available
  if (!selectedDb) {
    const res = handleCancel(
      await select({
        message: "Select DB",
        options: [
          { label: "mongodb", value: "mongodb" },
          { label: "mssql", value: "mssql" },
          { label: "mysql", value: "mysql" },
        ],
        initialValue: "mongodb",
      }),
    );

    selectedDb = res as "mongodb" | "mssql" | "mysql";
  }

  // ✅ Ask module type if missing
  if (!selectedModuleType) {
    const res = handleCancel(
      await select({
        message: "Module system",
        options: [
          { label: "ES Module", value: "module" },
          { label: "CommonJS", value: "commonjs" },
        ],
        initialValue: "commonjs",
      }),
    );

    selectedModuleType = res as "module" | "commonjs";
  }

  const isESM = selectedModuleType === "module";

  const dir = path.join(base, "src/services");
  await mkdir(dir, { recursive: true });

  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const modelPath = path.join(base, "src/models", `${modelName}.model.js`);

  // 🔥 Generate model first
  const relations = await generateModel(
    name,
    selectedModuleType!,
    selectedDb!,
    isESM,
    true,
    modelPath,
  );

  log.info("Generating service...");

  await serviceGenrate(selectedDb!, isESM, relations, name, dir, false);

  log.success(`Service ${name} created successfully!!`);
  outro("Happy coding! 🚀");
}
