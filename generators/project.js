
import fs from "fs-extra"
import path from "path"

export async function createStructure(base){

 const folders=[
 "src/config",
 "src/modules",
 "src/middlewares",
 "src/utils",
 "tests"
 ]

 for(const f of folders){
  await fs.mkdirp(path.join(base,f))
 }

 const app=`
import express from "express"
const app = express()
app.use(express.json())

app.get("/",(req,res)=>res.send("API running"))

export default app
`
 const server=`
import app from "./app.js"

app.listen(3000,()=>{
 console.log("Server started")
})
`
 await fs.writeFile(path.join(base,"src/app.js"),app)
 await fs.writeFile(path.join(base,"src/server.js"),server)
}
