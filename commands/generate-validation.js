import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { log } from "../helper/chalk.js";

export default async function (name) {
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
  execSync("npm install zod", { stdio: "inherit" });

  const dir = path.join(process.cwd(), "src/validation", name);
  await fs.mkdirp(dir);
  const isModule = answers.moduleType === "module";
  const controllerFile = isModule
    ? `
import { ${name}Schema } from "../../controllers/${name}.controller.js"; 
export default function(req, res) { 
    const validation = ${name}Schema.safeParse(req.body); 
    if (!validation.success) { 
        return res.status(400).json(validation.error); 
    } 
    res.json({ message: "${name} created", data: validation.data }); 
}`
    : `
const { ${name}Schema } = require("../../controllers/${name}.controller.js"); 
module.exports = function(req, res) { 
    const validation = ${name}Schema.safeParse(req.body); 
    if (!validation.success) { 
        return res.status(400).json(validation.error); 
    } 
    res.json({ message: "${name} created", data: validation.data }); 
}`;

  await fs.writeFile(path.join(dir, `${name}.validation.js`), controllerFile);

  log.success("Validation created");
}
