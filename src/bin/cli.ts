#!/usr/bin/env node

// @ts-ignore
import cac from "cac";
import pkg from "../../package.json";

import {
  create,
  auth,
  crud,
  validation,
  service,
  micro,
  plugin,
  test,
  swagger,
  model,
  route,
} from "../commands";

const cli = cac("create-smart-api");

/* ---------------- VERSION ---------------- */

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(pkg?.version || "unknown");
  process.exit(0);
}

/* ---------------- COMMANDS ---------------- */

// create
cli
  .command("create [name]", "Create a new API project")
  .alias("c")
  .action(create);

// CRUD
cli
  .command(
    "generate:crud <module> [framework] [moduleType]",
    "Generate CRUD operations for a module",
  )
  .alias("g:c")
  .action(crud);

// service
cli
  .command("generate:service <module> [moduleType]", "Generate a new service")
  .alias("g:s")
  .action(service);

// route
cli
  .command(
    "generate:route <module> [framework] [moduleType]",
    "Generate a new route",
  )
  .alias("g:r")
  .action(route);

// model
cli
  .command("generate:model <name> [moduleType] [db]", "Generate a new model")
  .alias("g:m")
  .action(model as any);

// auth
cli
  .command(
    "generate:auth [framework] [moduleType]",
    "Generate authentication setup",
  )
  .alias("g:a")
  .action(auth);

// validation
cli
  .command(
    "generate:validation <module> [moduleType]",
    "Generate validation setup",
  )
  .alias("g:v")
  .action(validation);

// microservice
cli
  .command("generate:microservice <name>", "Generate a new microservice")
  .alias("g:ms")
  .action(micro);

// plugin
cli
  .command("add:plugin [name]", "Add a new plugin")
  .alias("add:p")
  .action(plugin);

// tests
cli
  .command("generate:test <module> [moduleType]", "Generate tests for a module")
  .alias("g:t")
  .action(test);

// swagger
cli
  .command("generate:swagger", "Generate Swagger documentation setup")
  .action(async () => {
    await swagger();
  });

/* ---------------- HELP EXAMPLES ---------------- */

cli.help(() => {
  console.log(`
Examples:

  $ create-smart-api create my-api
  $ create-smart-api create

  $ create-smart-api generate:crud user
  $ create-smart-api generate:crud user express module

  $ create-smart-api generate:service user
  $ create-smart-api generate:validation user
  $ create-smart-api generate:swagger
`);
});

/* ---------------- PARSE ---------------- */

cli.parse();
