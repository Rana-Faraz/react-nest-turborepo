import {
  createBaseConfig,
  noOnlyTestsPlugin,
  nodeGlobals,
} from "@repo/eslint-config";

export default createBaseConfig({
  tsconfigRootDir: import.meta.dirname,
  extraGlobals: nodeGlobals,
  extraConfigs: [
    {
      files: ["tests/**/*.ts"],
      languageOptions: {
        parserOptions: {
          project: "./tsconfig.test.json",
          projectService: false,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins: {
        "no-only-tests": noOnlyTestsPlugin,
      },
      rules: {
        "no-only-tests/no-only-tests": "error",
      },
    },
  ],
});
