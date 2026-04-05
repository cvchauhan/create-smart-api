import path from "path";
import { execSync } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { saveProjectConfig } from "../helper/saveProjectConfig";

export default async function generatePackageJson(
  answers: {
    name: string;
    framework: "express" | "fastify";
    moduleType: "module" | "commonjs";
    db: "mongodb" | "mssql" | "mysql";
    crud: boolean;
    moduleName: string;
    port: number;
  },
  base: string,
) {
  const { framework, moduleType, db } = answers;
  execSync("npm init -y", { stdio: "inherit" });
  execSync('npm pkg set scripts.start="node src/server.js"', {
    stdio: "inherit",
  });

  if (moduleType === "module") {
    execSync("npm pkg set type=module", { stdio: "inherit" });
  }
  if (framework === "express") {
    execSync("npm install express", { stdio: "inherit" });
  }
  execSync("npm install -D dotenv", { stdio: "inherit" });

  if (framework === "fastify") {
    execSync("npm install fastify", { stdio: "inherit" });
  }

  if (db === "mongodb") {
    execSync("npm install mongoose", { stdio: "inherit" });
  }
  if (db === "mssql") {
    execSync("npm install sequelize tedious", { stdio: "inherit" });
  }
  if (db === "mysql") {
    execSync("npm install mysql2 sequelize", { stdio: "inherit" });
  }
  const pkgPath = path.join(base, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));

  await saveProjectConfig(base, {
    db,
    module: moduleType,
    framework,
  });

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}
