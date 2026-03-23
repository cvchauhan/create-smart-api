export default function routeContent(
  name: string,
  framework: string,
  isESM: boolean,
) {
  let routeContent: any;

  if (framework === "express") {
    routeContent = isESM
      ? `import express from "express";
import * as controller from "../controllers/${name}.controller.js";

const router = express.Router();

router.get("/", controller.getAll);
router.post("/", controller.create);

export default router;
`
      : `const express = require("express");
const controller = require("../controllers/${name}.controller");

const router = express.Router();

router.get("/", controller.getAll);
router.post("/", controller.create);

module.exports = router;
`;
  }

  if (framework === "fastify") {
    routeContent = isESM
      ? `
export default async function (fastify){

 fastify.get("/${name}s", async ()=>{
  return [];
 });

 fastify.post("/${name}s", async (req)=>{
  return req.body;
 });

}
`
      : `
module.exports = async function (fastify){

 fastify.get("/${name}s", async ()=>{
  return [];
 });

 fastify.post("/${name}s", async (req)=>{
  return req.body;
 });

};
`;
  }
  return routeContent;
}
