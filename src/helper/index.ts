import pc from "picocolors";
import box from "./box";

export const log = {
  success: (msg: string) =>
    console.log(
      box(pc.green(`✅ ${msg}`), { padding: 1, borderStyle: "round" }),
    ),

  error: (msg: string) => console.log(pc.red(`❌ ${msg}`)),

  warn: (msg: string) => console.log(pc.yellow(`⚠ ${msg}`)),

  info: (msg: string) => console.log(pc.cyan(`ℹ ${msg}`)),

  // ✨ Add subtle log (very useful)
  step: (msg: string) => console.log(pc.dim(`→ ${msg}`)),

  // ✨ Section header
  title: (msg: string) => console.log("\n" + pc.bold(pc.cyan(msg)) + "\n"),
  successBox: (title: string, details: Record<string, string>) => {
    const content =
      pc.green(`✅ ${title}\n\n`) +
      Object.entries(details)
        .map(([k, v]) => `${pc.gray(k)} : ${pc.white(v)}`)
        .join("\n");

    console.log(box(content, { padding: 1 }));
  },
};
