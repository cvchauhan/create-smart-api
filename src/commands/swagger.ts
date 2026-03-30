import path from "path";
import { prompt } from "../helper/promptAdapter";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import { spawnSync } from "child_process";
import { mkdir, writeFile } from "fs/promises";

export default async function generateSwagger(
  moduleType?: "module" | "commonjs",
) {
  const base = process.cwd();
  const config = getConfig(base);
  const answers = await prompt([
    {
      type: "select",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
      when: () => !moduleType && !config?.module,
    },
  ]);
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

  log.success("Swagger configuration created");
}
