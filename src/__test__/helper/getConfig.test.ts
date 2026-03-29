import { log } from "../../helper";
import { getConfig } from "../../helper/getConfig";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("Getconfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when name is missing", async () => {
    await getConfig("");

    expect(log.error).toHaveBeenCalledWith("Not inside a valid project");
  });
});
