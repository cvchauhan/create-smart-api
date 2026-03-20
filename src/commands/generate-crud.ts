import crud from "../generators/crud";
import { log } from "../helper";
import path from "path";
import fs from "fs-extra";

export default async function (
  name?: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  if (!name) {
    log.error("Module name is required");
    return;
  }
  const base = process.cwd();
  const srcPath = path.join(base, "./src");

  if (!fs.existsSync(srcPath) || !fs.lstatSync(srcPath).isDirectory()) {
    log.error(`Please create project first using: create-smart-api create`);
    return;
  }

  await crud(base, name, framework, moduleType);
}
