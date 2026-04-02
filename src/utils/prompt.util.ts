import { isCancel, cancel } from "@clack/prompts";

export function handleCancel<T>(value: T): T {
  if (isCancel(value)) {
    cancel("Operation cancelled");
    process.exit(1);
  }
  return value;
}
