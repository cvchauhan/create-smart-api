import fs from "fs-extra";
import path from "path";
import { log } from "../helper";
export function getConfig(base: string) {
  if (!fs.existsSync(path.join(base, "package.json"))) {
    log.error("❌ Not inside a valid project");
    return;
  }
  const pkg = fs.readJSONSync(path.join(base, "package.json"));
  return pkg.createSmartApi || {};
}
