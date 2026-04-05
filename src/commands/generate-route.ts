import path from "path";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import { genrateRouter } from "../utils/router.util";

import { select } from "@clack/prompts";
import { handleCancel } from "../utils/prompt.util";

export default async function (
  name: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  const base = process.cwd();
  const routesIndex = path.join(base, "src/routes/index.js");

  if (!name) {
    log.error("Router name is required");
    return;
  }

  const config = getConfig(base);

  let selectedFramework = config?.framework || framework;
  let selectedModuleType = config?.module || moduleType;

  // ✅ Ask only if missing
  if (!selectedFramework) {
    const res = handleCancel(
      await select({
        message: "Select Framework",
        options: [
          { label: "express", value: "express" },
          { label: "fastify", value: "fastify" },
        ],
        initialValue: "express",
      }),
    );

    selectedFramework = res as "express" | "fastify";
  }

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

  log.info("Generating router...");

  await genrateRouter(
    name,
    selectedFramework!,
    routesIndex,
    selectedModuleType!,
  );
}
