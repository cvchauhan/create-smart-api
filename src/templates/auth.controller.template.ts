import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export default async function generateAuthController(
  selectedFramework: "express" | "fastify",
  isModule: boolean,
  base: string,
) {
  const authDir = path.join(base, "src/controllers/auth");
  await mkdir(authDir, { recursive: true });
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

  await writeFile(path.join(authDir, `auth.controller.js`), authController);
}
