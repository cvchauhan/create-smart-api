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
} from "../commands/index.js";

const program = new Command();

program.command("create <name>").action(create);

program.command("generate:crud <module> [framework] [moduleType]").action(crud);
program
  .command("generate:service <module> [framework] [moduleType]")
  .action(service);
program.command("generate:auth [framework] [moduleType]").action(auth);
program.command("generate:validation <module> [moduleType]").action(validation);

program.command("generate:microservice <name>").action(micro);

program.command("add:plugin <name>").action(plugin);

program.command("generate:test <module> [moduleType]").action(test);
// program.command("generate:swagger <module>").action(test);
program
  .command("generate:swagger")
  .description("Generate Swagger documentation setup")
  .action(async () => {
    const projectPath = process.cwd();
    await swagger(projectPath);
  });

program.parse(process.argv);
