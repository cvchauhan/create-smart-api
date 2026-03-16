export default {
  // Specify the root directory of your tests
  roots: ["test"],

  // Match test files with this pattern
  testMatch: ["**/?(*.)+(spec|test).js"],

  // Use the default ESM transformer
  transform: {},

  // Since we're using ES modules, enable experimental ESM features
  //   extensionsToTreatAsEsm: [".js", ".jsx", ".ts", ".tsx"],

  // Module file extensions for importing
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],

  // Collect coverage info (optional)
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],

  // Other options can be added here
};
