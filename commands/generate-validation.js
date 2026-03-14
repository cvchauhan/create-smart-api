
import fs from "fs-extra"
import path from "path"
import { execSync } from "child_process"

export default async function(name){

 execSync("npm install zod",{stdio:"inherit"})

 const dir = path.join(process.cwd(),"src/modules",name)
 await fs.mkdirp(dir)

 const file = `
import {z} from "zod"

export const ${name}Schema = z.object({
 name:z.string(),
})
`

 await fs.writeFile(path.join(dir,`${name}.validation.js`),file)

 console.log("Validation created")
}
