import fs from "fs-extra";
import path from "path";
import { log } from "../helper";
import { generateDbConnectionCode } from "../helper/serverDbInject";

export async function createStructure(
  base: string,
  options: {
    framework: "express" | "fastify";
    moduleType: "module" | "commonjs";
    db: "mongodb" | "mssql" | "mysql";
    port: number;
  },
) {
  const src = path.join(base, "src");

  await fs.mkdirp(src);

  const folders = [
    "controllers",
    "services",
    "models",
    "routes",
    "config",
    "helper",
  ];

  for (const folder of folders) {
    await fs.mkdirp(path.join(src, folder));
  }

  const { framework, moduleType, port, db } = options;
  const isESM = moduleType === "module";

  const dbConnectionCode = generateDbConnectionCode(db, isESM);
  let serverContent: any;

  if (framework === "express") {
    if (isESM) {
      serverContent = `import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./helper/errorHandler.js";
import registerRoutes from "./routes/index.js";
dotenv.config();

${dbConnectionCode}


const app = express();

app.use(express.json());

registerRoutes(app);

app.get("/", (req,res)=>{
 res.json({message:"I love Create Smart API"});
});

app.use(errorHandler);

app.listen(${port},()=>{
 console.log("Server running on port ${port}");
});
`;
    } else {
      serverContent = `const express = require("express");
const dotenv = require("dotenv");
const { errorHandler } = require("./helper/errorHandler");
dotenv.config();
const registerRoutes = require("./routes");

${dbConnectionCode}

const app = express();

app.use(express.json());

registerRoutes(app);

app.get("/", (req,res)=>{
 res.json({message:"I love Create Smart API"});
});

app.use(errorHandler);

app.listen(${port},()=>{
 console.log("Server running on port ${port}");
});
`;
    }
  }

  if (framework === "fastify") {
    if (isESM) {
      serverContent = `import Fastify from "fastify";
import  dotenv from "dotenv";
dotenv.config();
import registerRoutes from "./routes/index.js";

${dbConnectionCode}

const app = Fastify();

await registerRoutes(app);

app.get("/", async ()=>{
 return {message:"I love Create Smart API"};
});

app.setErrorHandler((error, request, reply) => {
  reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message,
  });
});

app.listen({port:${port}});
`;
    } else {
      serverContent = `const Fastify = require("fastify");
dotenv.config();
const registerRoutes = require("./routes");

const registerRoutes = require("./routes");

${dbConnectionCode}

const app = Fastify();

registerRoutes(app);

app.get("/", async ()=>{
 return {message:"I love Create Smart API"};
});

app.setErrorHandler((error, request, reply) => {
  reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message,
  });
});

app.listen({port:${port}});
`;
    }
  }

  await fs.writeFile(path.join(src, "server.js"), serverContent);

  // Create a default routes index file (so server can import it immediately)
  const routesIndexPath = path.join(src, "routes", "index.js");
  const routesIndexContent = isESM
    ? `export default function registerRoutes(app) {\n  // register routes here\n}\n`
    : `module.exports = function registerRoutes(app) {\n  // register routes here\n};\n`;

  await fs.writeFile(routesIndexPath, routesIndexContent);
  const errorHandlerPath = path.join(src, "helper", "errorHandler.js");

  const errorHandlerContent = isESM
    ? `
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
`
    : `
function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = { errorHandler };
`;

  await fs.writeFile(errorHandlerPath, errorHandlerContent);
  log.success(`Server file created successfully`);
}
