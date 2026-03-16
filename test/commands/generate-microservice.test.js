import { jest } from "@jest/globals";

const mkdirpMock = jest.fn();

await jest.unstable_mockModule("fs-extra", () => ({
  default: {
    mkdirp: mkdirpMock,
  },
}));

await jest.unstable_mockModule("../../helper/chalk.js", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const { default: generateMicro } =
  await import("../../commands/generate-microservice.js");

const { log } = await import("../../helper/chalk.js");

describe("generate microservice command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });

  test("should log error when name is missing", async () => {
    await generateMicro();

    expect(log.error).toHaveBeenCalledWith("Microservice name is required");
    expect(mkdirpMock).not.toHaveBeenCalled();
  });

  test("should create microservice folder structure", async () => {
    await generateMicro("test-micro");

    const base = `${process.cwd()}/test-micro`;

    expect(log.success).toHaveBeenCalledWith("Microservice structure created");
  });
});
