import pluginInstaller from "../../commands/add-plugin";
import { execSync } from "child_process";
import { log } from "../../helper";

jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("../../helper/index", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
  addField: jest.fn(),
  editField: jest.fn(),
  parseFields: jest.fn().mockResolvedValue(["name:string"]),
  deleteField: jest.fn(),
  enhanceFields: jest.fn(),
  getTypeColor: jest.fn(),
  generateMongooseModel: jest.fn(),
  generateSequelizeModel: jest.fn(),
  showTablePreview: jest.fn(),
}));
describe("Plugin Installer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when no plugin name is provided", async () => {
    await pluginInstaller("");
    expect(log.error).toHaveBeenCalledWith("Plugin name is required");
  });

  test("should log error for invalid plugin name", async () => {
    await pluginInstaller("invalidPlugin");
    expect(log.error).toHaveBeenCalledWith(
      "Invalid plugin name. Valid options are: redis, kafka",
    );
  });

  test("should install redis plugin and log success", async () => {
    await pluginInstaller("redis");

    expect(execSync).toHaveBeenCalledWith("npm install redis", {
      stdio: "inherit",
    });

    expect(log.success).toHaveBeenCalledWith(
      "Plugin redis added successfully!!",
    );
  });

  test("should install kafka plugin and log success", async () => {
    await pluginInstaller("kafka");

    expect(execSync).toHaveBeenCalledWith("npm install kafkajs", {
      stdio: "inherit",
    });

    expect(log.success).toHaveBeenCalledWith(
      "Plugin kafka added successfully!!",
    );
  });
});
