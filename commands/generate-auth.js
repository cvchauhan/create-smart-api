
import fs from "fs-extra"
import path from "path"
import { execSync } from "child_process"

export default async function(){

 execSync("npm install jsonwebtoken bcrypt",{stdio:"inherit"})

 const dir = path.join(process.cwd(),"src/modules/auth")
 await fs.mkdirp(dir)

 const middleware=`
import jwt from "jsonwebtoken"

export default function(req,res,next){
 const token=req.headers.authorization
 if(!token) return res.status(401).send("Unauthorized")
 try{
  req.user=jwt.verify(token,"secret")
  next()
 }catch{
  res.status(401).send("Invalid")
 }
}
`
 await fs.writeFile(path.join(dir,"jwt.middleware.js"),middleware)

 console.log("Auth generator done")
}
