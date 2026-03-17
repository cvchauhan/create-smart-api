import { jest } from "@jest/globals";

import generateCrud from "../../src/commands/generate-crud";
import { log } from "../../src/helper/chalk";

describe("generate crud command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when module name is missing", async () => {
    await generateCrud();

    expect(log.error).toHaveBeenCalledWith("Module name is required");
    expect(generateCrud).not.toHaveBeenCalled();
  });

  test("should call crud generator when module name provided", async () => {
    await generateCrud("user", "express", "commonjs");

    expect(generateCrud).toHaveBeenCalledWith(
      process.cwd(),
      "user",
      "express",
      "commonjs",
    );
  });
});
