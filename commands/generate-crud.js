import crud from "../generators/crud.js";

export default async function (
  name,
  framework = "express",
  moduleType = "commonjs",
) {
  await crud(process.cwd(), name, framework, moduleType);
}
