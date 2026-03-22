import fs from "fs-extra";
import path from "path";
import { log } from "../helper";
import inquirer from "inquirer";
import { getConfig } from "../helper/getConfig";

export default async function (
  name: string,
  moduleType: "module" | "commonjs",
) {
  if (!name) {
    log.error("Module name is required");
    return;
  }
  const config = getConfig(process.cwd());
  const answers = await inquirer.prompt([
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
  const dir = path.join(process.cwd(), "src/services", name);
  await fs.mkdirp(dir);
  const isModule = answers.moduleType === "module";
  const service = isModule
    ? `
export const getAll = async ()=>{
 return [];
};

export const create = async (data)=>{
 return data;
};
`
    : `
module.exports.getAll = async ()=>{
 return [];
};

module.exports.create = async (data)=>{
 return data;
};
`;

  await fs.writeFile(path.join(dir, `${name}.service.js`), service);

  log.success("Service created");
}
