import generateSwagger from "../../commands/swagger";
import { prompt } from "../../helper/promptAdapter";
import path from "path";
import { log } from "../../helper";
import { mkdir, writeFile } from "fs/promises";

jest.mock("../../helper/promptAdapter", () => ({
  prompt: jest.fn(),
}));

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
  },
}));

const promptMock = prompt as any;

describe("generateSwagger", () => {
  const base = "/";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "cwd").mockReturnValue(base);
  });

  // ✅ CommonJS case
  test("should generate swagger with commonjs", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateSwagger();
    const swaggerPath = path.join(base, "src/config", "swagger.js");

    expect(mkdir).toHaveBeenCalledWith(path.join(base, "src/config"), {
      recursive: true,
    });

    expect(writeFile).toHaveBeenCalledWith(
      swaggerPath,
      expect.stringContaining('require("swagger-jsdoc")'),
    );

    expect(log.success).toHaveBeenCalledWith("Swagger configuration created");
  });

  // ✅ ESM case
  test("should generate swagger with ES module", async () => {
    promptMock.mockResolvedValue({
      moduleType: "module",
    });

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
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateSwagger();

    expect(mkdir).toHaveBeenCalledWith(path.join(base, "src/config"), {
      recursive: true,
    });
  });

  // ✅ when condition TRUE (moduleType not provided)
  let questions: any[];
  test("should evaluate when condition true", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return { moduleType: "commonjs" };
    });

    await generateSwagger();

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(true);
  });

  // ✅ when condition FALSE (moduleType provided)
  test("should evaluate when condition false when moduleType passed", async () => {
    promptMock.mockImplementation(async (q: any) => {
      questions = q;
      return {};
    });

    await generateSwagger("commonjs");

    const whenFn = questions[0].when;

    expect(whenFn()).toBe(false);
  });

  // ✅ validate full content (optional strong test)
  test("should include swagger setup route", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
    });

    await generateSwagger();

    const content = (writeFile as any).mock.calls[0][1];

    expect(content).toContain("/api-docs");
    expect(content).toContain("swaggerUi.setup");
  });
});
