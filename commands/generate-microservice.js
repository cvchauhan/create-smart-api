import fs from "fs-extra";
import path from "path";
import { log } from "../helper/chalk.js";

export default async function (name) {
  const base = path.join(process.cwd(), name);

  await fs.mkdirp(base + "/gateway");
  await fs.mkdirp(base + "/services/user");
  await fs.mkdirp(base + "/services/order");

  log.success("Microservice structure created");
}
