import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { createStructure } from "../generators/project.js";
import generateCrud from "../generators/crud.js";
import { log } from "../helper/chalk.js";

export default async function (name) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Project name",
      default: "my-app",
      when: () => !name,
    },
    {
      type: "list",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
    },
    {
      type: "list",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
    },
    {
      type: "list",
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
    },
    {
      type: "input",
      name: "port",
      message: "Port for the server",
      default: 3000,
    },
  ]);

  const base = path.join(process.cwd(), name);
  await fs.mkdirp(base);

  await createStructure(base, answers);

  process.chdir(base);

  execSync("npm init -y", { stdio: "inherit" });
  execSync('npm pkg set scripts.start="node src/server.js"', {
    stdio: "inherit",
  });
  if (answers.moduleType === "module") {
    execSync("npm pkg set type=module", { stdio: "inherit" });
  }
  if (answers.framework === "express") {
    execSync("npm install express dotenv", { stdio: "inherit" });
  }

  if (answers.framework === "fastify") {
    execSync("npm install fastify dotenv", { stdio: "inherit" });
  }

  if (answers.db === "mongodb") {
    execSync("npm install mongoose", { stdio: "inherit" });
  }
  if (answers.db === "mssql") {
    execSync("npm install mssql", { stdio: "inherit" });
  }
  if (answers.db === "mysql") {
    execSync("npm install mysql2 sequelize", { stdio: "inherit" });
  }

  if (answers.crud) {
    await generateCrud(
      base,
      answers.moduleName,
      answers.framework,
      answers.moduleType,
    );
  }

  log.success(
    `Project ${name} created successfully!! with ${answers.framework}, ${answers.db} and PORT: ${answers.port}  `,
  );
}
