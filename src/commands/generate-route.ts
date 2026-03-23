import path from "path";
import { log } from "../helper";
import inquirer from "inquirer";
import { getConfig } from "../helper/getConfig";
import { genrateRouter } from "../utils/router.util";

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
  let selectModuleType = config?.module || moduleType;
  const answers = await inquirer.prompt([
    {
      type: "select",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
      when: () => !selectedFramework,
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
      when: () => !selectModuleType,
    },
  ]);

  selectedFramework = selectedFramework || answers.framework;
  selectModuleType = selectModuleType || answers.moduleType;
  await genrateRouter(name, selectedFramework, routesIndex, selectModuleType);
}
