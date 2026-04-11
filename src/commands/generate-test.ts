import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import { existsSync, readFileSync } from "node:fs";
import { handleCancel } from "../utils/prompt.util";

export default async function (
  module: string,
  moduleType?: "module" | "commonjs",
) {
  if (!module) {
    log.error("Module name is required");
    return;
  }

  const base = process.cwd();

  const config = getConfig(base);

  const answers = {} as any;

  if (!moduleType && !config?.module) {
    const { select } = require("@clack/prompts");
    const res = handleCancel(
      await select({
        message: "Module system",
        options: [
          { label: "ES Module", value: "module" },
          { label: "CommonJS", value: "commonjs" },
        ],
        initialValue: "commonjs",
      }),
    );

    answers.moduleType = res;
  }

  const isModule = moduleType || answers.moduleType === "module";

  /* -------- INSTALL DEPENDENCIES (SAFE) -------- */
  const pkgPath = path.join(base, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  const devDeps = pkg.devDependencies || {};

  if (!devDeps.jest || !devDeps.supertest) {
    log.info("Installing jest & supertest...");
    spawnSync("npm", ["install", "jest", "supertest", "--save-dev"], {
      stdio: "inherit",
      shell: true,
    });
  }

  // ✅ Add test script only if not exists
  if (!pkg.scripts?.test) {
    pkg.scripts = {
      ...pkg.scripts,
      test: "jest",
    };
  }

  /* -------- CREATE TEST DIR -------- */
  const dir = path.join(base, "tests");
  await mkdir(dir, { recursive: true });

  const route = `/${module}s`; // ✅ fix plural

  /* -------- TEST CONTENT -------- */
  const testContent = isModule
    ? `import request from "supertest";
import app from "../src/server.js";

describe("${module} API", () => {

  test("GET ${route} → 200", async () => {
    const res = await request(app).get("${route}");
    expect(res.statusCode).toBe(200);
  });

  test("POST ${route} → 200", async () => {
    const res = await request(app)
      .post("${route}")
      .send({});
    expect(res.statusCode).toBe(200);
  });

});
`
    : `const request = require("supertest");
const app = require("../src/server");

describe("${module} API", () => {

  test("GET ${route} → 200", async () => {
    const res = await request(app).get("${route}");
    expect(res.statusCode).toBe(200);
  });

  test("POST ${route} → 200", async () => {
    const res = await request(app)
      .post("${route}")
      .send({});
    expect(res.statusCode).toBe(200);
  });

});
`;

  /* -------- WRITE TEST FILE -------- */
  await writeFile(path.join(dir, `${module}.test.js`), testContent);

  /* -------- SAFE JEST CONFIG -------- */
  const jestConfigPath = path.join(base, "jest.config.js");

  if (!existsSync(jestConfigPath)) {
    const jestConfig = isModule
      ? `export default { testEnvironment: "node" };`
      : `module.exports = { testEnvironment: "node" };`;

    await writeFile(jestConfigPath, jestConfig);
  }

  log.success(`Test file for ${module} created successfully!`);
}
