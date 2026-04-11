import path from "node:path";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { handleCancel } from "../utils/prompt.util";

export default async function generateSwagger(
  moduleType?: "module" | "commonjs",
) {
  const base = process.cwd();
  const config = getConfig(base);

  const answers = {} as any;

  if (!moduleType && !config?.module) {
    const { select } = require("@clack/prompts");
    const res = handleCancel(
      await select({
        message: "Module system",
        options: [
          { label: "ES Module", value: "module" },
          { label: "CommonJS", value: "commonjs" },
        ],
        initialValue: "commonjs",
      }),
    );

    answers.moduleType = res;
  }
  const swaggerDir = path.join(base, "src/config");
  await mkdir(swaggerDir, { recursive: true });
  log.info("Generating swagger...");
  let swaggerImport = "";
  spawnSync("npm", ["install", "swagger-jsdoc", "swagger-ui-express"], {
    stdio: "inherit",
    shell: true,
  });
  if (answers.moduleType === "module") {
    swaggerImport = `import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";`;
  } else {
    swaggerImport = `const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");`;
  }
  const exportContent =
    answers.moduleType === "module"
      ? `
export const swaggerDocs = (app) => { 
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};`
      : `
module.exports = {
    swaggerDocs: (app) => { 
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }    
};`;
  const content = `
${swaggerImport}

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Generated Swagger Docs"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["../routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

${exportContent}
`;

  await writeFile(path.join(swaggerDir, "swagger.js"), content);

  log.successBox("Swagger configuration created", {
    name: "swagger.js",
  });
}
