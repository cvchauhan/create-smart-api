import { execSync } from "child_process";

export default async function (name) {
  if (name === "redis") {
    execSync("npm install redis", { stdio: "inherit" });
  }

  if (name === "kafka") {
    execSync("npm install kafkajs", { stdio: "inherit" });
  }

  console.log(`✔ Plugin ${name} added successfully!!`);
}
