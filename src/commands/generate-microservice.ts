import path from "node:path";
import { log } from "../helper";
import { mkdir } from "node:fs/promises";

export default async function (name: string) {
  if (!name) {
    log.error("Microservice name is required");
    return;
  }
  const base = path.join(process.cwd(), name);

  await mkdir(base + "/gateway", { recursive: true });
  await mkdir(base + "/services/user", { recursive: true });
  await mkdir(base + "/services/order", { recursive: true });

  log.success("Microservice structure created");
}
