import { jest } from "@jest/globals";

const crudMock = jest.fn();

await jest.unstable_mockModule("../../generators/crud.js", () => ({
  default: crudMock,
}));

await jest.unstable_mockModule("../../helper/chalk.js", () => ({
  log: {
    error: jest.fn(),
  },
}));

const { default: generateCrud } =
  await import("../../commands/generate-crud.js");

const { log } = await import("../../helper/chalk.js");

describe("generate crud command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when module name is missing", async () => {
    await generateCrud();

    expect(log.error).toHaveBeenCalledWith("Module name is required");
    expect(crudMock).not.toHaveBeenCalled();
  });

  test("should call crud generator when module name provided", async () => {
    await generateCrud("user", "express", "commonjs");

    expect(crudMock).toHaveBeenCalledWith(
      process.cwd(),
      "user",
      "express",
      "commonjs",
    );
  });
});
