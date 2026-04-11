import path from "node:path";
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { saveProjectConfig } from "../helper/saveProjectConfig";
import { log } from "../helper";

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

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  const runNpm = (args: string[]) => {
    log.info(`Running ${npmCmd} ${args.join(" ")}`);
    spawnSync(npmCmd, args, {
      stdio: "inherit",
      shell: true,
    });
  };

  // Initialize package.json
  runNpm(["init", "-y"]);
  runNpm(["install", "-D", "dotenv"]);
  const installPkg = [];
  // Framework install
  if (framework === "express") {
    installPkg.push("express");
    // runNpm(["install", "express"]);
  }

  if (framework === "fastify") {
    installPkg.push("fastify");
    // runNpm(["install", "fastify"]);
  }

  // dotenv should be regular dependency, not dev dependency

  // Database dependencies
  if (db === "mongodb") {
    installPkg.push("mongoose");
  }

  if (db === "mssql") {
    installPkg.push("tedious", "sequelize");
  }

  if (db === "mysql") {
    installPkg.push("mysql2", "sequelize");
  }
  if (installPkg.length) {
    runNpm(["install", ...installPkg]);
  }

  const pkgPath = path.join(base, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  pkg.scripts = {
    ...pkg.scripts,
    start: "node src/server.js",
  };
  if (moduleType === "module") {
    pkg.type = "module";
  }
  await saveProjectConfig(base, {
    db,
    module: moduleType,
    framework,
  });

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}
