import crud from "../generators/crud";
import { log } from "../helper/chalk";

export default async function (
  name?: string,
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  if (!name) {
    log.error("Module name is required");
    return;
  }
  await crud(process.cwd(), name, framework, moduleType);
}
