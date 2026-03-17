#!/usr/bin/env node

import { Command } from "commander";

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
} from "../commands/index";

const program = new Command();

program
  .command("create [name]")
  .description("Create a new API project")
  .action(create);

program
  .command("generate:crud [module] [framework] [moduleType]")
  .description("Generate CRUD operations for a module")
  .action(crud);
program
  .command("generate:service [module] [moduleType]")
  .description("Generate a new service")
  .action(service);
program
  .command("generate:auth [framework] [moduleType]")
  .description("Generate authentication setup")
  .action(auth);
program
  .command("generate:validation [module] [moduleType]")
  .description("Generate validation setup")
  .action(validation);

program
  .command("generate:microservice <name>")
  .description("Generate a new microservice")
  .action(micro);

program
  .command("add:plugin [name]")
  .description("Add a new plugin")
  .action(plugin);

program
  .command("generate:test [module] [moduleType]")
  .description("Generate tests for a module")
  .action(test);
program
  .command("generate:swagger")
  .description("Generate Swagger documentation setup")
  .action(async () => {
    const projectPath = process.cwd();
    await swagger(projectPath);
  });
program.addHelpText(
  "after",
  `
Examples:

  $ create-smart-api create my-api or $ create-smart-api create
  $ create-smart-api generate:crud user or $ create-smart-api generate:crud user express module
  $ create-smart-api generate:crud product express module
  $ create-smart-api generate:service user
  $ create-smart-api generate:validation user
  $ create-smart-api generate:swagger
`,
);
program.parse(process.argv);
