
import fs from "fs-extra"
import path from "path"

export default async function(name){

 const base = path.join(process.cwd(),name)

 await fs.mkdirp(base+"/gateway")
 await fs.mkdirp(base+"/services/user")
 await fs.mkdirp(base+"/services/order")

 console.log("Microservice structure created")
}
