import generateSwagger from "../../commands/swagger";
import path from "path";
import { log } from "../../helper";
import { mkdir, writeFile } from "fs/promises";

import * as prompts from "@clack/prompts";

jest.mock("@clack/prompts", () => ({
  text: jest.fn(),
  select: jest.fn(),
  confirm: jest.fn(),
  isCancel: jest.fn(() => false),
  cancel: jest.fn(),
  intro: jest.fn(),
  outro: jest.fn(),
}));

const selectMock = prompts.select as jest.Mock;

jest.mock("child_process", () => ({
  spawnSync: jest.fn().mockReturnValue({
    status: 0,
    stdout: "mock success",
    stderr: "",
  }),
}));
jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    successBox: jest.fn(),
  },
}));

describe("generateSwagger", () => {
  const base = "/";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "cwd").mockReturnValue(base);
  });

  // ✅ CommonJS case
  test("should generate swagger with commonjs", async () => {
    selectMock.mockResolvedValueOnce("commonjs");

    await generateSwagger();
    const swaggerPath = path.join(base, "src/config", "swagger.js");

    expect(mkdir).toHaveBeenCalledWith(path.join(base, "src/config"), {
      recursive: true,
    });

    expect(writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining('require("swagger-jsdoc")'),
    );

    expect(log.successBox).toHaveBeenCalledWith(
      "Swagger configuration created",
      {
        name: "swagger.js",
      },
    );
  });

  // ✅ ESM case
  test("should generate swagger with ES module", async () => {
    selectMock.mockResolvedValueOnce("module");

    await generateSwagger();

    const swaggerPath = path.join(base, "src/config", "swagger.js");

    expect(writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining("import swaggerJsdoc"),
    );

    expect(writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining("export const swaggerDocs"),
    );
  });

  // ✅ ensureDir called
  test("should create config directory", async () => {
    selectMock.mockResolvedValueOnce("commonjs");

    await generateSwagger();

    expect(mkdir).toHaveBeenCalledWith(path.join(base, "src/config"), {
      recursive: true,
    });
  });

  // ✅ validate full content (optional strong test)
  test("should include swagger setup route", async () => {
    selectMock.mockResolvedValueOnce("commonjs");

    await generateSwagger();

    const content = (writeFile as any).mock.calls[0][1];

    expect(content).toContain("/api-docs");
    expect(content).toContain("swaggerUi.setup");
  });
});
