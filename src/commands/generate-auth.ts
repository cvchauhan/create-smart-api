import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";

export default async function (
  framework?: "express" | "fastify",
  moduleType?: "module" | "commonjs",
) {
  const config = getConfig(process.cwd());
  const answers = await inquirer.prompt([
    {
      type: "select",
      name: "framework",
      message: "Select Framework",
      default: "express",
      choices: ["express", "fastify"],
      when: () => !framework && !config?.framework,
    },
    {
      type: "rawlist",
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
  const selectedFramework = framework || answers.framework;
  const selectedModuleType = moduleType || answers.moduleType;
  const base = process.cwd();
  const middlewareDir = path.join(base, "src/middlewares");
  const authDir = path.join(base, "src/controllers/auth");
  const serviceDir = path.join(base, "src/services/auth");
  await fs.mkdirp(middlewareDir);
  await fs.mkdirp(authDir);
  await fs.mkdirp(serviceDir);
  execSync("npm install jsonwebtoken bcrypt", { stdio: "inherit" });
  const isModule = selectedModuleType === "module";

  const middleware =
    selectedFramework === "express"
      ? isModule
        ? `import jwt from "jsonwebtoken"; 
export default function(req, res, next) { 
  try { 
    const authHeader = req.headers.authorization; 
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" }); 
    const token = authHeader.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "Token missing" }); 
    req.user = jwt.verify(token, "secret"); next(); 
  } catch { 
    res.status(401).json({ message: "Invalid token" }); 
  } 
}`
        : `const jwt = require("jsonwebtoken"); 
module.exports = function(req, res, next) { 
  try { 
    const authHeader = req.headers.authorization; 
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" }); 
    const token = authHeader.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "Token missing" }); 
    req.user = jwt.verify(token, "secret"); next(); 
  } catch { 
    res.status(401).json({ message: "Invalid token" }); 
  } 
};`
      : isModule
        ? `import jwt from "jsonwebtoken"; 
export default async function (req, reply) { 
  try { 
    const authHeader = req.headers.authorization; 
    if (!authHeader) return reply.status(401).send({ message: "Authorization header missing" }); 
    const token = authHeader.split(" ")[1]; 
    if (!token) return reply.status(401).send({ message: "Token missing" }); 
    req.user = jwt.verify(token, "secret"); 
  } catch { 
    return reply.status(401).send({ message: "Invalid token" }); 
  } 
}`
        : `const jwt = require("jsonwebtoken"); 
module.exports = async function (req, reply) { 
  try { 
    const authHeader = req.headers.authorization; 
    if (!authHeader) return reply.status(401).send({ message: "Authorization header missing" }); 
    const token = authHeader.split(" ")[1]; 
    if (!token) return reply.status(401).send({ message: "Token missing" }); 
    req.user = jwt.verify(token, "secret"); 
  } catch { 
    return reply.status(401).send({ message: "Invalid token" }); 
  } 
};`;

  await fs.writeFile(
    path.join(middlewareDir, `auth.middleware.js`),
    middleware,
  );
  // ======================= // 🔐 AUTH SERVICE // =======================
  const authService = isModule
    ? ` 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 

export const register = async (user) => { 
  const hashedPassword = await bcrypt.hash(user.password, 10); 
  return { ...user, password: hashedPassword }; 
}; 

export const login = async (user) => { 
  const isValid = await bcrypt.compare(user.password, "hashedPassword"); 
  if (!isValid) throw new Error("Invalid credentials"); 
  const token = jwt.sign({ id: 1 }, "secret", { expiresIn: "1h" }); 
  return { token }; 
}; `
    : `const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken"); 

module.exports.register = async (user) => { 
  const hashedPassword = await bcrypt.hash(user.password, 10); 
  return { ...user, password: hashedPassword }; 
}; 

module.exports.login = async (user) => { 
  const isValid = await bcrypt.compare(user.password, "hashedPassword"); 
  if (!isValid) throw new Error("Invalid credentials"); 
  const token = jwt.sign({ id: 1 }, "secret", { expiresIn: "1h" }); 
  return { token }; 
}; `;
  await fs.writeFile(path.join(serviceDir, `auth.service.js`), authService);
  // ======================= // 🔐 AUTH CONTROLLER // =======================
  const importLine = isModule
    ? `import { register, login } from "../../services/auth/auth.service.js";`
    : `const { register, login } = require("../../services/auth/auth.service");`;

  const authController =
    selectedFramework === "express"
      ? isModule
        ? `
${importLine}

export const registerUser = async (req, res) => {
  const data = await register(req.body);
  res.json(data);
};

export const loginUser = async (req, res) => {
  const data = await login(req.body);
  res.json(data);
};
`
        : `
${importLine}

const registerUser = async (req, res) => {
  const data = await register(req.body);
  res.json(data);
};

const loginUser = async (req, res) => {
  const data = await login(req.body);
  res.json(data);
};

module.exports = { registerUser, loginUser };
`
      : isModule
        ? `
${importLine}

export default async function (fastify) {
  fastify.post("/register", async (req) => register(req.body));
  fastify.post("/login", async (req) => login(req.body));
}
`
        : `
${importLine}

module.exports = async function (fastify) {
  fastify.post("/register", async (req) => register(req.body));
  fastify.post("/login", async (req) => login(req.body));
};
`;

  await fs.writeFile(path.join(authDir, `auth.controller.js`), authController);

  log.success("Auth module + middleware generated successfully");
}
