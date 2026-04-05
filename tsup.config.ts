import { defineConfig } from "tsup";
import { builtinModules } from "module";

export default defineConfig({
  entry: ["src/bin/cli.ts"],
  outDir: "dist",
  format: ["cjs"],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  sourcemap: false,
  platform: "node",
  external: [...builtinModules, "prompts", "@clack/prompts"],
});
