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
} from "../commands/index.js";

const program = new Command();

program.command("create <name>").action(create);

program.command("generate:crud <module>").action(crud);
program.command("generate:service <module>").action(service);
program.command("generate:auth").action(auth);
program.command("generate:validation <module>").action(validation);

program.command("generate:microservice <name>").action(micro);

program.command("add:plugin <name>").action(plugin);

program.command("generate:test <module>").action(test);

program.parse(process.argv);
