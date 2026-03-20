import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { log } from "../helper";

export default async function generateSwagger(
  moduleType?: "module" | "commonjs",
) {
  const answers = await inquirer.prompt([
    {
      type: "rawlist",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
      when: () => !moduleType,
    },
  ]);
  const base = process.cwd();
  const swaggerDir = path.join(base, "src/config");

  await fs.ensureDir(swaggerDir);
  let swaggerImport = "";
  if (answers.moduleType === "module") {
    swaggerImport = `
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";`;
  } else {
    swaggerImport = `
const swaggerJsdoc = require("swagger-jsdoc");
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

  await fs.writeFile(path.join(swaggerDir, "swagger.js"), content);

  log.success("Swagger configuration created");
}
