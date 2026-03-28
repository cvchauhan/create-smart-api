import { generateDbConnectionCode } from "../../helper/serverDbInject";

jest.mock("fs-extra", () => ({
  existsSync: jest.fn(),
}));

jest.mock("../../helper", () => ({
  log: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("Database Creation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log error when name is missing", () => {
    generateDbConnectionCode("mssql", true);
  });
});
