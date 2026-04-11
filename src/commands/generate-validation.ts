import path from "node:path";
import { log } from "../helper";
import { getConfig } from "../helper/getConfig";
import { mkdir, writeFile } from "node:fs/promises";
import { handleCancel } from "../utils/prompt.util";

export default async function (
  name: string,
  moduleType?: "module" | "commonjs",
) {
  if (!name) {
    log.error("Module name is required");
    return;
  }

  const config = getConfig(process.cwd());

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

  const dir = path.join(process.cwd(), "src/validation", name);
  await mkdir(dir, { recursive: true });

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

  await writeFile(path.join(dir, `${name}.validation.js`), validationContent);

  log.success(`Validation for ${name} created successfully!`);
}

// helper
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
