import { jest } from "@jest/globals";
const execSyncMock = jest.fn();
jest.unstable_mockModule("child_process", () => ({ execSync: execSyncMock }));
const log = { error: jest.fn(), success: jest.fn() };
jest.unstable_mockModule("../../src/helper/chalk", () => ({ log }));

const { default: pluginInstaller } =
  await import("../../src/commands/add-plugin");
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
    expect(execSyncMock).toHaveBeenCalledWith("npm install redis", {
      stdio: "inherit",
    });
    expect(log.success).toHaveBeenCalledWith(
      "Plugin redis added successfully!!",
    );
  });
  test("should install kafka plugin and log success", async () => {
    await pluginInstaller("kafka");
    expect(execSyncMock).toHaveBeenCalledWith("npm install kafkajs", {
      stdio: "inherit",
    });
    expect(log.success).toHaveBeenCalledWith(
      "Plugin kafka added successfully!!",
    );
  });
});
