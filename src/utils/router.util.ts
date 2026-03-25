import fs from "fs-extra";
import path from "path";
import routesContent from "../templates/route.template";
import { log } from "../helper";

class Router {
  genrateRouter = async (
    routeName: string,
    framework: "express" | "fastify",
    routesIndex: string,
    moduleType: string,
  ) => {
    if (!routeName) {
      log.error("Router name is required");
      return;
    }

    const name = routeName.toLowerCase();
    const isESM = moduleType === "module";
    const base = process.cwd();

    const routePath = path.join(base, "src/routes", `${name}.routes.js`);

    const routeContent = routesContent(name, framework, isESM);
    await fs.writeFile(routePath, routeContent);

    const routesDir = path.dirname(routesIndex);

    const routeFiles = (await fs.readdir(routesDir)).filter(
      (f) => f.endsWith(".routes.js") && f !== "index.js",
    );

    const importLines: string[] = [];
    const registerLines: string[] = [];

    for (const file of routeFiles) {
      const moduleName = file.replace(".routes.js", "");
      const routeVarName = `${moduleName}Routes`;

      /* -------- EXPRESS -------- */
      if (framework === "express") {
        if (isESM) {
          importLines.push(`import ${routeVarName} from "./${file}";`);
          registerLines.push(`  app.use("/${moduleName}s", ${routeVarName});`);
        } else {
          importLines.push(`const ${routeVarName} = require("./${file}");`);
          registerLines.push(`  app.use("/${moduleName}s", ${routeVarName});`);
        }
      }

      /* -------- FASTIFY -------- */
      if (framework === "fastify") {
        if (isESM) {
          importLines.push(`import ${routeVarName} from "./${file}";`);
          registerLines.push(
            `  await app.register(${routeVarName}, { prefix: "/${moduleName}s" });`,
          );
        } else {
          importLines.push(`const ${routeVarName} = require("./${file}");`);
          registerLines.push(
            `  await app.register(${routeVarName}, { prefix: "/${moduleName}s" });`,
          );
        }
      }
    }

    /* -------- BUILD INDEX FILE -------- */

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
  };
}

const router = new Router();
export const genrateRouter = router.genrateRouter.bind(router);
