import path from "node:path";
import { log } from "../helper";
import { existsSync, readFileSync } from "node:fs";
import { saveProjectConfig } from "../helper/saveProjectConfig";

export function getConfig(base: string) {
  const smartConfigPath = path.join(base, ".smart-api.json");
  const pkgPath = path.join(base, "package.json");

  // 1. Prefer .smart-api.json
  if (existsSync(smartConfigPath)) {
    try {
      const config = JSON.parse(readFileSync(smartConfigPath, "utf-8"));
      return config;
    } catch {
      log.error("Invalid .smart-api.json format");
      return {};
    }
  }

  // 2. Fallback to package.json (legacy support)
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

      const config: any = {
        module: pkg.type || "commonjs",
      };

      const dependencies = pkg.dependencies || {};

      // DB detection
      if (dependencies.mongoose) {
        config.db = "mongodb";
      } else if (dependencies.sequelize) {
        if (dependencies.tedious) {
          config.db = "mssql";
        } else if (dependencies.mysql2) {
          config.db = "mysql";
        } else {
          config.db = "mssql";
        }
      }

      // framework detection
      for (const fw of ["express", "fastify"]) {
        if (dependencies[fw]) {
          config.framework = fw;
          break;
        }
      }

      // save only clean config
      saveProjectConfig(base, config);

      return config; // ✅ IMPORTANT
    } catch {
      log.error("Invalid package.json format");
      return {};
    }
  }

  // 3. Not a valid project
  log.error("Not inside a valid project");
  return {};
}
