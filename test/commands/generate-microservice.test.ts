import { jest } from "@jest/globals";

const mkdirpMock = jest.fn();

await jest.unstable_mockModule("fs-extra", () => ({
  default: {
    mkdirp: mkdirpMock,
  },
}));

import { log } from "../../src/helper/chalk";
import generateMicro from "../../src/commands/generate-microservice";

describe("generate microservice command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });

  test("should log error when name is missing", async () => {
    await generateMicro("");

    expect(log.error).toHaveBeenCalledWith("Microservice name is required");
    expect(mkdirpMock).not.toHaveBeenCalled();
  });

  test("should create microservice folder structure", async () => {
    await generateMicro("test-micro");

    const base = `${process.cwd()}/test-micro`;

    expect(log.success).toHaveBeenCalledWith("Microservice structure created");
  });
});
