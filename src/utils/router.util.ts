import fs from "fs-extra";
import path from "path";

class Router {
  async genrateRouter(
    routesIndex: string,
    framework?: "express" | "fastify",
    isESM?: boolean,
  ) {
    const routesDir = path.dirname(routesIndex);

    // Rebuild routes index to include all generated route modules (idempotent)
    const routeFiles = (await fs.readdir(routesDir)).filter(
      (f) => f.endsWith(".routes.js") && f !== "index.js",
    );

    const importLines = [];
    const registerLines = [];

    for (const file of routeFiles) {
      const moduleName = file.replace(".routes.js", "");
      const routeVarName = `${moduleName}Routes`;

      if (framework === "express") {
        if (isESM) {
          importLines.push(`import ${routeVarName} from "./${file}";`);
          registerLines.push(`  app.use("/${moduleName}s", ${routeVarName});`);
        } else {
          importLines.push(`const ${routeVarName} = require("./${file}");`);
          registerLines.push(`  app.use("/${moduleName}s", ${routeVarName});`);
        }
      }

      if (framework === "fastify") {
        if (isESM) {
          importLines.push(`import ${routeVarName} from "./${file}";`);
          registerLines.push(`  await app.register(${routeVarName});`);
        } else {
          importLines.push(`const ${routeVarName} = require("./${file}");`);
          registerLines.push(`  await app.register(${routeVarName});`);
        }
      }
    }

    let routesIndexContent = "";

    if (framework === "express") {
      if (isESM) {
        routesIndexContent = `${importLines.join("\n")}
  
  export default function registerRoutes(app) {
  ${registerLines.join("\n")}
  }
  `;
      } else {
        routesIndexContent = `${importLines.join("\n")}
  
  module.exports = function registerRoutes(app) {
  ${registerLines.join("\n")}
  };
  `;
      }
    }

    if (framework === "fastify") {
      if (isESM) {
        routesIndexContent = `${importLines.join("\n")}
  
  export default async function registerRoutes(app) {
  ${registerLines.join("\n")}
  }
  `;
      } else {
        routesIndexContent = `${importLines.join("\n")}
  
  module.exports = async function registerRoutes(app) {
  ${registerLines.join("\n")}
  };
  `;
      }
    }

    await fs.writeFile(routesIndex, routesIndexContent);
  }
}

export const router = new Router();
