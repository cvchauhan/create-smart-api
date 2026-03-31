import { showTablePreview } from "../../helper/showTablePreview";

jest.mock("picocolors", () => ({
  bold: (t: string) => t,
  cyan: (t: string) => t,
  yellow: (t: string) => t,
  green: (t: string) => t,
  blue: (t: string) => t,
  gray: (t: string) => t,
  magenta: (t: string) => t,
  white: (t: string) => t,
}));

describe("showTablePreview", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render table with basic fields", () => {
    const fields = [
      {
        name: "name",
        type: "string",
        required: true,
        unique: false,
        default: "",
      },
    ];

    showTablePreview(fields as any);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should handle enum fields correctly", () => {
    const fields = [
      {
        name: "status",
        type: "string",
        required: false,
        unique: false,
        default: "active",
        enumValues: ["active", "inactive"],
      },
    ];

    showTablePreview(fields as any);

    const logs = consoleSpy.mock.calls.flat().join(" ");

    expect(logs).toContain("enum(active, inactive)");
  });

  it("should calculate summary correctly", () => {
    const fields = [
      { name: "a", type: "string", required: true, unique: true },
      { name: "b", type: "number", required: false, unique: false },
    ];

    showTablePreview(fields as any);

    const logs = consoleSpy.mock.calls.flat().join(" ");

    expect(logs).toContain("Total Fields");
    expect(logs).toContain("Required");
    expect(logs).toContain("Unique");
    expect(logs).toContain("Optional");
  });

  it("should handle empty fields array", () => {
    showTablePreview([]);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should render multiple rows", () => {
    const fields = [
      { name: "a", type: "string" },
      { name: "b", type: "number" },
    ];

    showTablePreview(fields as any);

    const logs = consoleSpy.mock.calls.flat().join(" ");

    expect(logs).toContain("a");
    expect(logs).toContain("b");
  });

  it("should render table borders", () => {
    const fields = [{ name: "a", type: "string" }];

    showTablePreview(fields as any);

    const logs = consoleSpy.mock.calls.flat().join(" ");

    expect(logs).toContain("╭");
    expect(logs).toContain("╯");
    expect(logs).toContain("│");
  });
});
