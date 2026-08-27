import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    // tsup still injects the deprecated baseUrl option through its TypeScript
    // 6 API path. Keep the compatibility exception scoped to declaration
    // bundling; the repository's TypeScript 7 configs do not use baseUrl.
    compilerOptions: { ignoreDeprecations: "6.0" },
  },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outDir: "dist",
  skipNodeModulesBundle: true,
});
