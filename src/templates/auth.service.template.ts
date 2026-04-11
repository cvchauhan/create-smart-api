import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export default async function generateAuthService(
  base: string,
  isModule: boolean,
) {
  const serviceDir = path.join(base, "src/services/auth");
  await mkdir(serviceDir, { recursive: true });
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
  await writeFile(path.join(serviceDir, `auth.service.js`), authService);
}
