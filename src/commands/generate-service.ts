import fs from "fs-extra";
import path from "path";
import { log } from "../helper";
import { prompt } from "../helper/promptAdapter";
import { getConfig } from "../helper/getConfig";
import serviceGenrate from "../templates/service.template";
import generateModel from "./model";

export default async function (
  name: string,
  moduleType: "module" | "commonjs",
) {
  if (!name) {
    log.error("Service name is required");
    return;
  }
  const config = getConfig(process.cwd());
  const answers = await prompt([
    {
      type: "select",
      name: "db",
      message: "Select DB",
      default: "mongodb",
      choices: ["mongodb", "mssql", "mysql"],
      when: () => !config?.db,
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
  const dir = path.join(process.cwd(), "src/services");
  await fs.mkdirp(dir);
  const isESM = answers.moduleType === "module";
  const selectedDb = answers.db || config?.db;
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const base = process.cwd();
  const modelPath = path.join(base, "src/models", `${modelName}.model.js`);
  const relations = await generateModel(
    name,
    answers.moduleType,
    selectedDb,
    isESM,
    true,
    modelPath,
  );
  log.info("Generating service...");
  await serviceGenrate(selectedDb, isESM, relations, name, dir, false);
  log.success("Service created");
}
