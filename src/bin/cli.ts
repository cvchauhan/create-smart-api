#!/usr/bin/env node

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

/* ---------------- TYPES ---------------- */

type CommandHandler = (...args: any[]) => any;

interface Command {
  name: string;
  alias?: string;
  handler: CommandHandler;
}

/* ---------------- COMMANDS MAP ---------------- */

const commands: Command[] = [
  { name: "create", alias: "c", handler: create },
  { name: "generate:crud", alias: "g:c", handler: crud },
  { name: "generate:service", alias: "g:s", handler: service },
  { name: "generate:route", alias: "g:r", handler: route },
  { name: "generate:model", alias: "g:m", handler: model as any },
  { name: "generate:auth", alias: "g:a", handler: auth },
  { name: "generate:validation", alias: "g:v", handler: validation },
  { name: "generate:microservice", alias: "g:ms", handler: micro },
  { name: "generate:test", alias: "g:t", handler: test },
  { name: "add:plugin", alias: "add:p", handler: plugin },
  { name: "generate:swagger", handler: swagger },
];

/* ---------------- HELP ---------------- */

function showHelp() {
  console.log(`
Usage: create-smart-api <command> [options]

Commands:
  create [name]                     Create a new API project

  generate:crud <module>            Generate CRUD
  generate:service <module>         Generate service
  generate:route <module>           Generate route
  generate:model <name>             Generate model
  generate:auth                     Setup authentication
  generate:validation <module>      Generate validation
  generate:microservice <name>      Generate microservice
  generate:test <module>            Generate test

  add:plugin [name]                 Add plugin

  generate:swagger                  Setup Swagger

Aliases:
  c, g:c, g:s, g:r, g:m, g:a, g:v, g:ms, g:t, add:p

Examples:
  create-smart-api create my-api
  create-smart-api create .
  create-smart-api generate:crud user
  create-smart-api generate:service user
  create-smart-api generate:swagger
`);
}

/* ---------------- VERSION ---------------- */

function showVersion() {
  console.log(pkg?.version || "unknown");
}

/* ---------------- FIND COMMAND ---------------- */

function findCommand(cmd: string): Command | undefined {
  return commands.find((c) => c.name === cmd || c.alias === cmd);
}

/* ---------------- MAIN ---------------- */

async function main() {
  const args = process.argv.slice(2);

  const cmd = args[0];

  // version
  if (args.includes("--version") || args.includes("-v")) {
    showVersion();
    return;
  }

  // help
  if (!cmd || cmd === "--help" || cmd === "-h") {
    showHelp();
    return;
  }

  const command = findCommand(cmd);

  if (!command) {
    console.log(`❌ Unknown command: ${cmd}`);
    console.log(`👉 Run 'create-smart-api --help'`);
    return;
  }

  try {
    // pass remaining args
    await command.handler(...args.slice(1));
  } catch (err: any) {
    console.error("❌ Error:", err?.message || err);
  }
}

/* ---------------- RUN ---------------- */

main();
