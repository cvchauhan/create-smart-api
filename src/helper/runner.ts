import { spawnSync } from "child_process";

export function run(cmd: string, args: string[], options: any = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  return {
    success: result.status === 0,
    error: result.error,
    code: result.status,
  };
}
