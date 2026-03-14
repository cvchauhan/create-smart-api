
import crud from "../generators/crud.js"

export default async function(name){
 await crud(process.cwd(),name)
}
