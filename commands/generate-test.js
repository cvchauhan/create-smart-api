import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { log } from "../helper/chalk.js";

export default async function (module) {
  const answers = await inquirer.prompt([
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
  execSync("npm install jest supertest --save-dev", { stdio: "inherit" });
  execSync('npm pkg set scripts.test="jest"', {
    stdio: "inherit",
  });
  const dir = path.join(base, "tests");
  await fs.mkdirp(dir);
  const isModule = answers.moduleType === "module";
  let testContent = "";
  let jestConfig = "";
  /* ---------------- TEST FILE ---------------- */ if (isModule) {
    testContent = ` 
import request from "supertest"; 
import app from "../src/server.js"; 
describe("${module} API", () => { 
    test("GET /${module} should return 200", async () => { 
        const res = await request(app).get("/${module}"); 
        expect(res.statusCode).toBe(200); 
    }); 
}); `;
    jestConfig = ` 
export default { testEnvironment: "node" }; `;
  } else {
    testContent = ` 
const request = require("supertest"); 
const app = require("../src/server"); 
describe("${module} API", () => { 
    test("GET /${module} should return 200", async () => { 
        const res = await request(app).get("/${module}"); 
        expect(res.statusCode).toBe(200); 
    }); 
}); `;
    jestConfig = ` 
module.exports = { testEnvironment: "node" }; `;
  }
  /* ---------------- WRITE FILES ---------------- */ await fs.writeFile(
    path.join(dir, `${module}.test.js`),
    testContent,
  );
  await fs.writeFile(path.join(base, "jest.config.js"), jestConfig);
  log.success("Jest test generated successfully");
}
