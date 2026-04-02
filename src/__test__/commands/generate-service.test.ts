import generateService from "../../commands/generate-service";
import path from "path";
import { log } from "../../helper";
import { mkdir, writeFile } from "fs/promises";

jest.mock("../../commands/model", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue([
    {
      type: "1:1",
      target: "User",
      field: "userId",
      required: true,
    },
  ]),
}));

const modelMock = require("../../commands/model").default as jest.Mock;

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn().mockResolvedValue(["index.routes.js"]),
  existsSync: jest.fn().mockReturnValue(true),
  lstatSync: jest.fn().mockReturnValue({ isDirectory: () => true }),
  readdirSync: jest.fn().mockReturnValue(["index.routes.js"]),
}));

jest.mock("../../helper", () => ({
  log: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("picocolors", () => {
  const white: any = jest.fn(); // function
  white.bold = jest.fn(); // attach property

  return {
    pc: jest.fn(),
    bold: jest.fn(),
    cyan: jest.fn(),
    gray: jest.fn(),
    green: jest.fn(),
    red: jest.fn(),
    yellow: jest.fn(),
    blue: jest.fn(),
    magenta: jest.fn(),
    white, // ✅ both work now
  };
});

const promptMock = prompt as any;

describe("generateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const cwdMock = "/mock-root";

  beforeEach(() => {
    jest.spyOn(process, "cwd").mockReturnValue(cwdMock);
  });

  // ✅ Error case
  test("should log error if name is missing", async () => {
    await generateService("", "commonjs");

    expect(log.error).toHaveBeenCalledWith("Service name is required");
    expect(mkdir).not.toHaveBeenCalled();
  });

  // ✅ CommonJS case
  test("should generate service in commonjs", async () => {
    promptMock.mockResolvedValue({
      moduleType: "commonjs",
      action: "continue",
      db: "mongodb",
    });

    await generateService("user", "commonjs");

    const dir = path.join(cwdMock, "src/services");

    expect(mkdir).toHaveBeenCalledWith(dir, { recursive: true });

    const filePath = path.join(dir, "user.service.js");

    expect(writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("module.exports"),
    );

    expect(log.success).toHaveBeenCalledWith(
      "Service user created successfully!!",
    );
  });

  // ✅ ES Module case
  test("should generate service in ES module", async () => {
    modelMock.mockResolvedValueOnce([
      {
        type: "N:N",
        target: "Profile",
        field: "profileId",
        required: true,
      },
    ]);
    promptMock.mockResolvedValue({
      moduleType: "module",
      action: "continue",
      db: "mongodb",
    });

    await generateService("product", "module");

    const dir = path.join(cwdMock, "src/services");

    const filePath = path.join(dir, "product.service.js");

    expect(writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("export const"),
    );
  });
  test("should generate service in ES module with mssql db", async () => {
    modelMock.mockResolvedValueOnce([
      {
        type: "N:N",
        target: "Profile",
        field: "profileId",
        required: true,
      },
    ]);
    promptMock.mockResolvedValue({
      moduleType: "module",
      action: "continue",
      db: "mssql",
    });

    await generateService("product", "module");

    const dir = path.join(cwdMock, "src/services");

    const filePath = path.join(dir, "product.service.js");

    expect(writeFile).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining("export const"),
    );
  });
});
