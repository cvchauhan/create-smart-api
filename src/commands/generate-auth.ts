import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import generatAuthMiddleware from "../templates/middleware.template";
import generateAuthService from "../templates/auth.service.template";
import generateAuthController from "../templates/auth.controller.template";
import { spawnSync } from "node:child_process";
import { handleCancel } from "../utils/prompt.util";

export default async function (
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  log.info("Generating auth module...");
  const { select } = require("@clack/prompts");
  const config = getConfig(process.cwd()) || {};

  let selectedFramework = framework || config?.framework;
  let selectedModuleType = moduleType || config?.module;

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

  const base = process.cwd();
  const isModule = selectedModuleType === "module";

  // 🚀 Install deps (optimized)
  log.step("Installing auth dependencies...");
  spawnSync("npm", ["install", "jsonwebtoken", "bcrypt"], {
    stdio: "inherit",
    shell: true,
  });

  await generatAuthMiddleware(selectedFramework!, isModule, base);
  await generateAuthService(base, isModule);
  await generateAuthController(selectedFramework!, isModule, base);

  log.success("Auth module + middleware generated successfully!");
}
