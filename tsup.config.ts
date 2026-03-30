export default {
  entry: ["src/bin/cli.ts"],
  OutDir: "dist",
  format: ["cjs"],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  external: ["prompts", "cli-table3"],
};
