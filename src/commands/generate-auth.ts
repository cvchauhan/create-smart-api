import { prompt } from "../helper/promptAdapter";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import generatAuthMiddleware from "../templates/middleware.template";
import generateAuthService from "../templates/auth.service.template";
import generateAuthController from "../templates/auth.controller.template";
import { execSync } from "child_process";

export default async function (
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  const config = getConfig(process.cwd());
  const answers = await prompt([
    {
      type: "select",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
      when: () => !framework && !config?.framework,
    },
    {
      type: "rawlist",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
      when: () => !moduleType && !config?.module,
    },
  ]);
  const selectedFramework = framework || answers.framework;
  const selectedModuleType = moduleType || answers.moduleType;
  const base = process.cwd();
  execSync("npm install jsonwebtoken bcrypt", { stdio: "inherit" });
  const isModule = selectedModuleType === "module";

  // 🔥 Generate files
  log.info("Generating auth module...");

  await generatAuthMiddleware(selectedFramework, isModule, base);

  await generateAuthService(base, isModule);

  await generateAuthController(selectedFramework, isModule, base);

  log.success("Auth module + middleware generated successfully");
}
