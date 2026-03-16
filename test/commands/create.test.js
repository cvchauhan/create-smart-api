import { jest } from "@jest/globals";
const execSyncMock = jest.fn();
const mkdirpMock = jest.fn();
const createStructureMock = jest.fn();
const generateCrudMock = jest.fn();
const promptMock = jest.fn();
jest.unstable_mockModule("child_process", () => ({
  execSync: execSyncMock,
}));
jest.unstable_mockModule("fs-extra", () => ({
  default: { mkdirp: mkdirpMock },
}));
jest.unstable_mockModule("inquirer", () => ({
  default: { prompt: promptMock },
}));
jest.unstable_mockModule("../../generators/project.js", () => ({
  createStructure: createStructureMock,
}));
jest.unstable_mockModule("../../generators/crud.js", () => ({
  default: generateCrudMock,
}));
jest.unstable_mockModule("../../helper/chalk.js", () => ({
  log: { success: jest.fn() },
}));
const { default: create } = await import("../../commands/create.js");
const { log } = await import("../../helper/chalk.js");
describe("create command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, "chdir").mockImplementation(() => {});
  });
  test("should create project and install express", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "commonjs",
      db: "mongodb",
      crud: false,
      port: 3000,
    });
    await create("test-app");
    expect(mkdirpMock).toHaveBeenCalled();
    expect(createStructureMock).toHaveBeenCalled();
    expect(execSyncMock).toHaveBeenCalledWith("npm init -y", {
      stdio: "inherit",
    });
    expect(execSyncMock).toHaveBeenCalledWith("npm install express dotenv", {
      stdio: "inherit",
    });
    expect(execSyncMock).toHaveBeenCalledWith("npm install mongoose", {
      stdio: "inherit",
    });
    expect(log.success).toHaveBeenCalled();
  });
  test("should generate CRUD module when enabled", async () => {
    promptMock.mockResolvedValue({
      framework: "express",
      moduleType: "commonjs",
      db: "mongodb",
      crud: true,
      moduleName: "sample",
      port: 3000,
    });
    await create("test-app");
    expect(generateCrudMock).toHaveBeenCalledWith(
      expect.any(String),
      "sample",
      "express",
      "commonjs",
    );
  });
  test("should generate CRUD with different selection module when enabled", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "module",
      db: "mongodb",
      crud: true,
      moduleName: "sample",
      port: 3000,
    });
    await create("test-app");
    expect(generateCrudMock).toHaveBeenCalledWith(
      expect.any(String),
      "sample",
      "fastify",
      "module",
    );
  });
  test("should generate CRUD with mysql database selection module when enabled", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "module",
      db: "mysql",
      crud: true,
      moduleName: "sample",
      port: 3000,
    });
    await create("test-app");
    expect(generateCrudMock).toHaveBeenCalledWith(
      expect.any(String),
      "sample",
      "fastify",
      "module",
    );
  });
  test("should generate CRUD with mssql database selection module when enabled", async () => {
    promptMock.mockResolvedValue({
      framework: "fastify",
      moduleType: "module",
      db: "mssql",
      crud: true,
      moduleName: "sample",
      port: 3000,
    });
    await create("test-app");
    expect(generateCrudMock).toHaveBeenCalledWith(
      expect.any(String),
      "sample",
      "fastify",
      "module",
    );
  });
  test("should ask project name when name is not provided", async () => {
    promptMock.mockResolvedValue({
      name: "my-test-app",
      framework: "express",
      moduleType: "commonjs",
      db: "mongodb",
      crud: false,
      moduleName: "sample",
      port: 3000,
    });

    await create();

    expect(promptMock).toHaveBeenCalled();
  });
});
