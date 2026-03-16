import chalk from "chalk";
import boxen from "boxen";
export const log = {
  success: (msg) =>
    console.log(
      chalk.bgBlack(
        boxen(chalk.green(`✔ ${msg}`), {
          padding: 1,
          borderColor: "green",
          borderStyle: "round",
        }),
      ),
    ),
  error: (msg) =>
    console.log(
      boxen(chalk.red(`✖ ${msg}`), {
        padding: 1,
        borderColor: "red",
        borderStyle: "round",
      }),
    ),
  warn: (msg) =>
    console.log(
      boxen(chalk.yellow(`⚠ ${msg}`), {
        padding: 1,
        borderColor: "yellow",
        borderStyle: "round",
      }),
    ),
  info: (msg) =>
    console.log(
      boxen(chalk.blue(`ℹ ${msg}`), {
        padding: 1,
        borderColor: "blue",
        borderStyle: "round",
      }),
    ),
};
