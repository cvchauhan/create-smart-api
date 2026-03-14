
import fs from "fs-extra"
import path from "path"
import { execSync } from "child_process"

export default async function(module){

 execSync("npm install jest supertest --save-dev",{stdio:"inherit"})

 const dir = path.join(process.cwd(),"tests")
 await fs.mkdirp(dir)

 const test=`
import request from "supertest"
import app from "../src/app.js"

describe("${module} API",()=>{

 test("should return 200",async()=>{

  const res = await request(app).get("/${module}")
  expect(res.statusCode).toBe(200)

 })

})
`

 await fs.writeFile(path.join(dir,`${module}.test.js`),test)

 const config=`
export default {
 testEnvironment:"node"
}
`
 await fs.writeFile("jest.config.js",config)

 console.log("Jest test generated")
}
