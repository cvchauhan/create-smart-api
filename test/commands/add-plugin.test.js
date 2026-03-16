import { jest } from "@jest/globals";

const execSyncMock = jest.fn();

jest.unstable_mockModule("child_process", () => ({
  execSync: execSyncMock,
}));

jest.unstable_mockModule("../../helper/chalk.js", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const { default: pluginInstaller } =
  await import("../../commands/add-plugin.js");
const { log } = await import("../../helper/chalk.js");

describe("Plugin Installer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when no plugin name is provided", async () => {
    await pluginInstaller();
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
