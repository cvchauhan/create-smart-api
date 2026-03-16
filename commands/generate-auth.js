import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
export default async function () {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
    },
    {
      type: "list",
      name: "moduleType",
      message: "Module system",
      default: "commonjs",
      choices: [
        { name: "ES Module", value: "module" },
        { name: "CommonJS", value: "commonjs" },
      ],
    },
  ]);
  const base = process.cwd();
  const dir = path.join(base, "src/middlewares");
  await fs.mkdirp(dir);
  execSync("npm install jsonwebtoken bcrypt", { stdio: "inherit" });
  const isModule = answers.moduleType === "module";
  let middleware = "";
  /* EXPRESS */ if (answers.framework === "express") {
    if (isModule) {
      middleware = ` 
import jwt from "jsonwebtoken"; 
export default function(req, res, next) {   
    try { 
        const authHeader = req.headers.authorization; 
        if (!authHeader) { 
            return res.status(401).json({ message: "Authorization header missing" });
        } 
        const token = authHeader.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Token missing" });
        }
        req.user = jwt.verify(token, "secret"); 
        next(); 
    } catch (err) { 
        res.status(401).send("Invalid token"); 
    } 
} `;
    } else {
      middleware = ` 
const jwt = require("jsonwebtoken"); 
module.exports = function(req, res, next) {
    try { 
        const authHeader = req.headers.authorization; 
        if (!authHeader) { 
            return res.status(401).json({ message: "Authorization header missing" });
        } 
        const token = authHeader.split(" ")[1];
        if (!token) {
        return res.status(401).json({ message: "Token missing" });
        }
        req.user = jwt.verify(token, "secret"); 
        next(); 
    } catch (err) { 
        res.status(401).send("Invalid token"); 
    } 
}; `;
    }
  }
  /* FASTIFY */ if (answers.framework === "fastify") {
    if (isModule) {
      middleware = ` 
import jwt from "jsonwebtoken"; 
export default async function (req, reply) { 
    try { 
        const authHeader = req.headers.authorization; 
        if (!authHeader) {     
            return reply.status(401).json({ message: "Authorization header missing" }); 
        } 
        const token = authHeader.split(" ")[1];
        if (!token) {
          return reply.status(401).json({ message: "Token missing" });
        }
        req.user = jwt.verify(token, "secret"); 
    } catch (err) { 
        return reply.status(401).json({ message: "Invalid token" }); 
    } 
} `;
    } else {
      middleware = ` 
const jwt = require("jsonwebtoken"); 
module.exports = async function (req, reply) { 
    try { 
        const authHeader = req.headers.authorization; 
        if (!authHeader) { 
            return reply.status(401).json({ message: "Authorization header missing" }); 
        } 
        const token = authHeader.split(" ")[1];
        if (!token) {
          return reply.status(401).json({ message: "Token missing" });
        }
        req.user = jwt.verify(token, "secret"); 
    } catch (err) { 
        return reply.status(401).json({ message: "Invalid token" }); 
    } 
}; `;
    }
  }
  await fs.writeFile(path.join(dir, "auth.middleware.js"), middleware);
  console.log("Auth middleware generated successfully");
}
