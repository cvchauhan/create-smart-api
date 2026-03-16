import fs from "fs-extra";
import path from "path";
import { log } from "../helper/chalk.js";

export default async function (name) {
  if (!name) {
    log.error("Module name is required");
    return;
  }
  const dir = path.join(process.cwd(), "src/modules", name);
  await fs.mkdirp(dir);

  const service = `
export const getAll${name} = async ()=>{
 return []
}
`;

  await fs.writeFile(path.join(dir, `${name}.service.js`), service);

  log.success("Service created");
}
