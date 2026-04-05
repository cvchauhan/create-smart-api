import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import generatAuthMiddleware from "../templates/middleware.template";
import generateAuthService from "../templates/auth.service.template";
import generateAuthController from "../templates/auth.controller.template";
import { execSync } from "child_process";

import { select } from "@clack/prompts";
import { handleCancel } from "../utils/prompt.util";

export default async function (
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
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
  execSync("npm install jsonwebtoken bcrypt", { stdio: "inherit" });

  // 🔥 Generate files
  log.info("Generating auth module...");

  await generatAuthMiddleware(selectedFramework!, isModule, base);
  await generateAuthService(base, isModule);
  await generateAuthController(selectedFramework!, isModule, base);

  log.success("Auth module + middleware generated successfully!");
}
