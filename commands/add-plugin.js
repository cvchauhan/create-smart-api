import { execSync } from "child_process";
import { log } from "../helper/chalk.js";

export default async function (name) {
  if (name === "redis") {
    execSync("npm install redis", { stdio: "inherit" });
  }

  if (name === "kafka") {
    execSync("npm install kafkajs", { stdio: "inherit" });
  }

  log.success(`Plugin ${name} added successfully!!`);
}
