import chalk from "chalk";
import boxen from "boxen";

const warning = chalk.hex("#FFA500");
const infoColor = chalk.cyan;

const log = {
  success: (msg: string) =>
    console.log(
      chalk.bgBlack(
        boxen(chalk.green(`✅ ${msg}`), {
          padding: 1,
          borderColor: "green",
          borderStyle: "round",
        }),
      ),
    ),

  error: (msg: string) =>
    console.log(
      boxen(chalk.red(`❌ ${msg}`), {
        padding: 1,
        borderColor: "red",
        borderStyle: "round",
      }),
    ),

  warn: (msg: string) =>
    console.log(
      boxen(warning(`⚠️ ${msg}`), {
        padding: 1,
        borderColor: "yellow",
        borderStyle: "round",
      }),
    ),

  info: (msg: string) =>
    console.log(
      boxen(infoColor(`ℹ️ ${msg}`), {
        padding: 1,
        borderColor: "cyan",
        borderStyle: "round",
      }),
    ),
};

export { log };
