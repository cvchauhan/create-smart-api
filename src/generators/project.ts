import fs from "fs-extra";
import path from "path";
import { log } from "../helper";

export async function createStructure(
  base: string,
  options: {
    framework: "express" | "fastify";
    moduleType: "module" | "commonjs";
    port: number;
  },
) {
  const src = path.join(base, "src");

  await fs.mkdirp(src);

  const folders = ["controllers", "services", "models", "routes", "config"];

  for (const folder of folders) {
    await fs.mkdirp(path.join(src, folder));
  }

  const { framework, moduleType, port } = options;
  const isESM = moduleType === "module";

  let serverContent: any;

  if (framework === "express") {
    if (isESM) {
      serverContent = `
import express from "express";
import { config } from "dotenv";
config();
import registerRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

registerRoutes(app);

app.get("/", (req,res)=>{
 res.json({message:"I love Create Smart API"});
});

app.listen(${port},()=>{
 console.log("Server running on port ${port}");
});
`;
    } else {
      serverContent = `
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const registerRoutes = require("./routes");

const app = express();

app.use(express.json());

registerRoutes(app);

app.get("/", (req,res)=>{
 res.json({message:"I love Create Smart API"});
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
import { config } from "dotenv";
config();
import registerRoutes from "./routes/index.js";

const app = Fastify();

await registerRoutes(app);

app.get("/", async ()=>{
 return {message:"I love Create Smart API"};
});

app.listen({port:${port}});
`;
    } else {
      serverContent = `
const Fastify = require("fastify");
dotenv.config();
const registerRoutes = require("./routes");

const registerRoutes = require("./routes");

const app = Fastify();

registerRoutes(app);

app.get("/", async ()=>{
 return {message:"I love Create Smart API"};
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
