import fs from "fs-extra";
import path from "path";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import inquirer from "inquirer";

export default async function (
  name: string,
  moduleType?: "module" | "commonjs",
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

  const isModule = moduleType || answers.moduleType === "module";

  const dir = path.join(process.cwd(), "src/validation", name);
  await fs.mkdirp(dir);

  // ✅ Only schema (no controller logic)
  const validationContent = isModule
    ? `import { z } from "zod";

export const ${name}Schema = z.object({
  // TODO: define fields
});

export const validate${capitalize(name)} = (data) => {
  return ${name}Schema.safeParse(data);
};
`
    : `const { z } = require("zod");

const ${name}Schema = z.object({
  // TODO: define fields
});

const validate${capitalize(name)} = (data) => {
  return ${name}Schema.safeParse(data);
};

module.exports = {
  ${name}Schema,
  validate${capitalize(name)}
};
`;

  await fs.writeFile(
    path.join(dir, `${name}.validation.js`),
    validationContent,
  );

  log.success("Validation created");
}

// helper
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
