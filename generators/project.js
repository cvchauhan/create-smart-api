import fs from "fs-extra";
import path from "path";
import { log } from "../helper/chalk.js";

export async function createStructure(base, options) {
  const src = path.join(base, "src");

  await fs.mkdirp(src);

  const folders = ["controllers", "services", "models", "routes", "config"];

  for (const folder of folders) {
    await fs.mkdirp(path.join(src, folder));
  }

  const { framework, moduleType, port } = options;
  const isESM = moduleType === "module";

  let serverContent;

  if (framework === "express") {
    if (isESM) {
      serverContent = `
import express from "express";
import registerRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

registerRoutes(app);

app.get("/", (req,res)=>{
 res.json({message:"API running"});
});

app.listen(${port},()=>{
 console.log("Server running on port ${port}");
});
`;
    } else {
      serverContent = `
const express = require("express");
const registerRoutes = require("./routes");

const app = express();

app.use(express.json());

registerRoutes(app);

app.get("/", (req,res)=>{
 res.json({message:"API running"});
});

app.listen(${port},()=>{
 console.log("Server running on port ${port}");
});
`;
    }
  }

  if (framework === "fastify") {
    if (isESM) {
      serverContent = `
import Fastify from "fastify";
import registerRoutes from "./routes/index.js";

const app = Fastify();

await registerRoutes(app);

app.get("/", async ()=>{
 return {message:"API running"};
});

app.listen({port:${port}});
`;
    } else {
      serverContent = `
const Fastify = require("fastify");
const registerRoutes = require("./routes");

const app = Fastify();

registerRoutes(app);

app.get("/", async ()=>{
 return {message:"API running"};
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

  log.success(`Server file created successfully`);
}
