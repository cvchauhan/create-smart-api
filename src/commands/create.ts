import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { createStructure } from "../generators/project";
import generateCrud from "../generators/crud";
import { log } from "../helper";
import { generateDbConfig } from "../utils/db.util";
import {
  validateOnlyNumber,
  validateName,
} from "../utils/field.validation.util";

export default async function (name: string) {
  const answers: {
    name: string;
    framework: "express" | "fastify";
    moduleType: "module" | "commonjs";
    db: "mongodb" | "mssql" | "mysql";
    crud: boolean;
    moduleName: string;
    port: number;
  } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Project name",
      default: "my-app",
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
      type: "rawlist",
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

  const base = path.join(process.cwd(), name || answers.name);
  await fs.mkdirp(base);

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

  await fs.writeFile(dbPath, generateDbConfig(answers.moduleType, dialect));

  /* -------- ENV FILE -------- */

  const envPath = path.join(base, ".env");
  const envContent =
    dialect === "mongodb"
      ? `
DB_URL=mongodb://localhost:27017/mydb
PORT=${answers.port}
      `
      : `
DB_NAME=test_db
DB_USER=root
DB_PASS=password
DB_HOST=localhost
PORT=${answers.port}
`;
  await fs.writeFile(envPath, envContent);

  process.chdir(base);

  execSync("npm init -y", { stdio: "inherit" });
  execSync('npm pkg set scripts.start="node src/server.js"', {
    stdio: "inherit",
  });

  if (answers.moduleType === "module") {
    execSync("npm pkg set type=module", { stdio: "inherit" });
  }
  if (answers.framework === "express") {
    execSync("npm install express", { stdio: "inherit" });
  }
  execSync("npm install -D dotenv", { stdio: "inherit" });

  if (answers.framework === "fastify") {
    execSync("npm install fastify", { stdio: "inherit" });
  }

  if (answers.db === "mongodb") {
    execSync("npm install mongoose", { stdio: "inherit" });
  }
  if (answers.db === "mssql") {
    execSync("npm install sequelize tedious", { stdio: "inherit" });
  }
  if (answers.db === "mysql") {
    execSync("npm install mysql2 sequelize", { stdio: "inherit" });
  }
  const pkgPath = path.join(base, "package.json");
  const pkg = await fs.readJSON(pkgPath);

  pkg.createSmartApi = {
    db: answers.db,
    module: answers.moduleType,
    framework: answers.framework,
  };

  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
  if (answers.crud) {
    await generateCrud(
      base,
      answers.moduleName,
      answers.framework,
      answers.moduleType,
      answers.db,
      true,
    );
  }

  log.success(
    `Project ${name || answers.name} created successfully!! with ${answers.framework}, ${answers.db} and PORT: ${answers.port}  `,
  );
}
