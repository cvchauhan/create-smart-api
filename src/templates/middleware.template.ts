import { mkdir, writeFile } from "fs/promises";
import path from "path";

export default async function generatAuthMiddleware(
  selectedFramework: "express" | "fastify",
  isModule: boolean,
  base: string,
) {
  const middlewareDir = path.join(base, "src/middlewares");
  await mkdir(middlewareDir, { recursive: true });
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

  await writeFile(path.join(middlewareDir, `auth.middleware.js`), middleware);
}
