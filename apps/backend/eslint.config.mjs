import {
  createBaseConfig,
  noOnlyTestsPlugin,
  nodeGlobals,
  vitestGlobals,
  vitestPlugin,
} from "@repo/eslint-config";

export default createBaseConfig({
  tsconfigRootDir: import.meta.dirname,
  extraGlobals: nodeGlobals,
  extraConfigs: [
    {
      files: ["src/**/*.spec.ts", "src/**/*.test.ts"],
      languageOptions: {
        globals: vitestGlobals,
      },
      plugins: {
        "no-only-tests": noOnlyTestsPlugin,
        vitest: vitestPlugin,
      },
      rules: {
        ...(vitestPlugin.configs.recommended.rules ?? {}),
        "no-only-tests/no-only-tests": "error",
      },
    },
  ],
});
