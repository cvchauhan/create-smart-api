import crud from "../generators/crud";
import { log } from "../helper";
import path from "node:path";
import { getConfig } from "../helper/getConfig";
import { existsSync, lstatSync } from "node:fs";

export default async function (
  name: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  if (!name) {
    log.error("Module name is required");
    return;
  }
  const base = process.cwd();
  const srcPath = path.join(base, "./src");
  const config = getConfig(base);

  const selectFramework = framework || config?.framework;
  const selectModuleType = moduleType || config?.module;
  const selectdb = config?.db;

  if (!existsSync(srcPath) || !lstatSync(srcPath).isDirectory()) {
    log.error(`Please create project first using: create-smart-api create`);
    return;
  }
  log.info("Generating CRUD module...");
  await crud(base, name, selectFramework, selectModuleType, selectdb);
}
