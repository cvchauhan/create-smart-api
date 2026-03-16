import { execSync } from "child_process";
import { log } from "../helper/chalk.js";

export default async function (name) {
  if (!name) {
    log.error("Plugin name is required");
    return;
  }
  const validPlugins = ["redis", "kafka"];
  if (!validPlugins.includes(name)) {
    log.error(
      `Invalid plugin name. Valid options are: ${validPlugins.join(", ")}`,
    );
    return;
  }
  if (name === "redis") {
    execSync("npm install redis", { stdio: "inherit" });
  }

  if (name === "kafka") {
    execSync("npm install kafkajs", { stdio: "inherit" });
  }

  log.success(`Plugin ${name} added successfully!!`);
}
