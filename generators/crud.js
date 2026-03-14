
import fs from "fs-extra"
import path from "path"

export default async function(base,name){

 const dir = path.join(base,"src/modules",name)
 await fs.mkdirp(dir)

 const controller=`
import * as service from "./${name}.service.js"

export const getAll=async(req,res)=>{
 const data = await service.getAll${name}()
 res.json(data)
}
`
 const routes=`
import express from "express"
import {getAll} from "./${name}.controller.js"

const router=express.Router()
router.get("/",getAll)

export default router
`

 await fs.writeFile(path.join(dir,`${name}.controller.js`),controller)
 await fs.writeFile(path.join(dir,`${name}.routes.js`),routes)

 console.log("CRUD generated")
}
