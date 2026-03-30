import {
  createBaseConfig,
  jestGlobals,
  jestPlugin,
  noOnlyTestsPlugin,
  nodeGlobals,
} from "@repo/eslint-config";

export default createBaseConfig({
  tsconfigRootDir: import.meta.dirname,
  extraGlobals: nodeGlobals,
  extraConfigs: [
    {
      files: ["src/**/*.spec.ts", "src/**/*.test.ts"],
      languageOptions: {
        globals: jestGlobals,
      },
      plugins: {
        jest: jestPlugin,
        "no-only-tests": noOnlyTestsPlugin,
      },
      rules: {
        ...(jestPlugin.configs["flat/recommended"]?.rules ?? {}),
        "no-only-tests/no-only-tests": "error",
      },
    },
  ],
});
