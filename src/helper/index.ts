import pc from "picocolors";
import box from "./box";

export const log = {
  success: (msg: string) =>
    console.log(
      box(pc.green(`✅ ${msg}`), { padding: 1, borderStyle: "round" }),
    ),

  error: (msg: string) =>
    console.log(box(pc.red(`❌ ${msg}`), { padding: 1, borderStyle: "round" })),

  warn: (msg: string) =>
    console.log(
      box(pc.yellow(`⚠️ ${msg}`), { padding: 1, borderStyle: "round" }),
    ),

  info: (msg: string) =>
    console.log(
      box(pc.cyan(`ℹ️ ${msg}`), { padding: 1, borderStyle: "round" }),
    ),
};
