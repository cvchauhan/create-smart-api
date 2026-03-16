import fs from "fs-extra";
import path from "path";

export default async function (name) {
  const dir = path.join(process.cwd(), "src/modules", name);
  await fs.mkdirp(dir);

  const service = `
export const getAll${name} = async ()=>{
 return []
}
`;

  await fs.writeFile(path.join(dir, `${name}.service.js`), service);

  console.log("✔ Service created");
}
