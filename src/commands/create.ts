import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
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
import { handleCancel } from "../utils/prompt.util";

export default async function (name: string) {
  const { text, select, intro, outro } = require("@clack/prompts");
  intro("Create Smart API 🚀");
  const answers: any = {};

  // Project name
  if (!name) {
    const res = handleCancel(
      await text({
        message: "Project name (Press Enter for current directory)",
        initialValue: "",
        validate: (input: any) => {
          const regex = /^[a-zA-Z0-9._-]+$/;

          if (input && !regex.test(input)) {
            return "Only letters, numbers, ., _, - allowed";
          }

          return undefined; //
        },
      }),
    );

    answers.name = res;
  }

  // Framework
  {
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

    answers.framework = res;
  }

  // Module type
  {
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

    answers.moduleType = res;
  }

  // DB
  {
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
    answers.db = res;
  }

  // CRUD confirm
  {
    const { confirm } = require("@clack/prompts");
    const res = handleCancel(
      await confirm({
        message: "Generate sample CRUD module?",
        initialValue: true,
      }),
    );

    answers.crud = res;
  }

  // Module name (conditional)
  if (answers.crud) {
    const res = handleCancel(
      await text({
        message: "CRUD module name",
        initialValue: "sample",
        validate: validateName as any,
      }),
    );

    answers.moduleName = res;
  }

  // Port
  {
    const res = handleCancel(
      await text({
        message: "Port for the server",
        initialValue: "3000",
        validate: (val: any) => {
          const r = validateOnlyNumber(val) as any;
          if (r === true) return;
          if (r === false) return "Only numbers allowed";
          return r;
        },
      }),
    );

    answers.port = Number(res);
  }
  log.step("Creating project structure...");

  const inputName = name || answers.name;

  const isCurrentDir = !inputName || inputName === ".";

  const base = isCurrentDir
    ? process.cwd()
    : path.join(process.cwd(), inputName);

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
  const folderName = isCurrentDir
    ? path.basename(process.cwd())
    : path.basename(name || answers.name);
  log.successBox("Project setup complete! 🚀", {
    name: folderName,
    framework: answers.framework,
    database: answers.db,
    port: answers.port.toString(),
  });

  outro("Project setup complete!");
}
