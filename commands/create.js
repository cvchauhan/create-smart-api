import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { createStructure } from "../generators/project.js";

export default async function (name) {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "db",
      message: "Select DB",
      choices: ["mongodb", "mssql", "mysql"],
    },
  ]);

  const base = path.join(process.cwd(), name);
  await fs.mkdirp(base);

  await createStructure(base);

  process.chdir(base);

  execSync("npm init -y && npm pkg set type=module", { stdio: "inherit" });
  execSync("npm install express dotenv", { stdio: "inherit" });

  if (answers.db === "mongodb")
    execSync("npm install mongoose", { stdio: "inherit" });
  if (answers.db === "mssql")
    execSync("npm install mssql", { stdio: "inherit" });
  if (answers.db === "mysql")
    execSync("npm install mysql2 sequelize", { stdio: "inherit" });

  console.log("Project created");
}
