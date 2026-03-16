import crud from "../generators/crud.js";
import { log } from "../helper/chalk.js";

export default async function (name, framework, moduleType) {
  if (!name) {
    log.error("Module name is required");
    return;
  }
  await crud(process.cwd(), name, framework, moduleType);
}
