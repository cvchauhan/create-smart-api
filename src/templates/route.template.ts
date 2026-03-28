export default function getrouteContent(
  name: string,
  framework: string,
  isESM: boolean,
) {
  let routeContent: any;

  /* -------- EXPRESS -------- */
  if (framework === "express") {
    routeContent = isESM
      ? `import express from "express";
import * as controller from "../controllers/${name}.controller.js";

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
`
      : `const express = require("express");
const controller = require("../controllers/${name}.controller");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
`;
  }

  /* -------- FASTIFY -------- */
  if (framework === "fastify") {
    routeContent = isESM
      ? `import * as controller from "../controllers/${name}.controller.js";

export default async function (app){

  app.get("/", controller.getAll);
  app.get("/:id", controller.getById);
  app.post("/", controller.create);
  app.put("/:id", controller.update);
  app.delete("/:id", controller.remove);

}
`
      : `const controller = require("../controllers/${name}.controller");

module.exports = async function (app){

  app.get("/", controller.getAll);
  app.get("/:id", controller.getById);
  app.post("/", controller.create);
  app.put("/:id", controller.update);
  app.delete("/:id", controller.remove);

};
`;
  }

  return routeContent;
}
