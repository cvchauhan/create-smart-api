import { spawnSync } from "child_process";
import { log } from "../helper";

export default async function (name: string) {
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
    spawnSync("npm", ["install", "redis"], { stdio: "inherit", shell: true });
  }

  if (name === "kafka") {
    spawnSync("npm", ["install", "kafkajs"], { stdio: "inherit", shell: true });
  }

  log.success(`Plugin ${name} added successfully!!`);
}
