export function handleCancel<T>(value: T): T {
  const { isCancel, cancel } = require("@clack/prompts");
  if (isCancel(value)) {
    cancel("Operation cancelled");
    process.exit(1);
  }
  return value;
}
