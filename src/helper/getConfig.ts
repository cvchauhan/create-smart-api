import path from "path";
import { log } from "../helper";
import { existsSync, readFileSync } from "fs";
export function getConfig(base: string) {
  if (!existsSync(path.join(base, "package.json"))) {
    log.error("Not inside a valid project");
    return;
  }
  const pkg = JSON.parse(
    readFileSync(path.join(base, "package.json"), "utf-8"),
  );
  return pkg.createSmartApi || {};
}
