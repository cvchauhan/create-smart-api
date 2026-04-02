import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prompt } from "../helper/promptAdapter";
import { createStructure } from "../generators/project";
import generateCrud from "../generators/crud";
import { log } from "../helper";
import { generateDbConfig } from "../utils/db.util";
import {
  validateOnlyNumber,
  validateName,
} from "../utils/field.validation.util";
import generateEnvFile from "../templates/env.template";
import generatePackageJson from "../templates/package.json.template";

export default async function (name: string) {
  const answers: {
    name: string;
    framework: "express" | "fastify";
    moduleType: "module" | "commonjs";
    db: "mongodb" | "mssql" | "mysql";
    crud: boolean;
    moduleName: string;
    port: number;
  } = await prompt([
    {
      type: "input",
      name: "name",
      message: "Project name (Press Enter for current directory)",
      default: ".",
      when: () => !name,
      validate: validateName,
    },
    {
      type: "select",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
    },
    {
      type: "select",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
    },
    {
      type: "select",
      name: "db",
      message: "Select DB",
      default: "mongodb",
      choices: ["mongodb", "mssql", "mysql"],
    },
    {
      type: "confirm",
      name: "crud",
      message: "Generate sample CRUD module?",
      default: true,
    },
    {
      type: "input",
      name: "moduleName",
      message: "CRUD module name",
      default: "sample",
      when: (a) => a.crud,
      validate: validateName,
    },
    {
      type: "input",
      name: "port",
      message: "Port for the server",
      default: 3000,
      validate: validateOnlyNumber,
    },
  ]);
  log.step("Creating project structure...");

  const folderName =
    name || answers.name === "."
      ? path.basename(process.cwd())
      : path.basename(name || answers.name);

  const base = path.join(process.cwd(), folderName);
  await mkdir(base, { recursive: true });

  await createStructure(base, answers);

  const dbPath = path.join(base, "src/config/db.js");

  const dialect =
    answers.db === "mysql"
      ? "mysql"
      : answers.db === "mssql"
        ? "mssql"
        : answers.db === "mongodb"
          ? "mongodb"
          : "sqlite";

  await writeFile(dbPath, generateDbConfig(answers.moduleType, dialect));

  /* -------- ENV FILE -------- */

  const envPath = path.join(base, ".env");
  log.step("Generating .env file...");
  await generateEnvFile(answers.port, envPath, dialect);
  log.info(".env file created");

  log.step("Generating package.json file...");
  process.chdir(base);
  await generatePackageJson(answers, base);
  log.info("package.json file created");

  if (answers.crud) {
    log.step("Generating crud module...");
    await generateCrud(
      base,
      answers.moduleName,
      answers.framework,
      answers.moduleType,
      answers.db,
      true,
    );
    log.info("CRUD module created");
  }

  log.successBox("Project setup complete! 🚀", {
    name: folderName,
    framework: answers.framework,
    database: answers.db,
    port: answers.port.toString(),
  });
}
