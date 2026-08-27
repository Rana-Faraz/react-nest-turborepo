import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import {
  browserGlobals,
  createBaseConfig,
  noOnlyTestsPlugin,
  vitestGlobals,
  vitestPlugin,
} from "@repo/eslint-config";

export default createBaseConfig({
  tsconfigRootDir: import.meta.dirname,
  extraGlobals: browserGlobals,
  ignores: ["public/dist/**"],
  extraConfigs: [
    {
      files: ["**/*.{ts,tsx}"],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        "@eslint-react": eslintReact,
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh,
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        "@eslint-react/no-duplicate-key": "error",
        "@eslint-react/no-missing-key": "error",
        "react-refresh/only-export-components": "off",
      },
    },
    {
      files: ["src/**/*.{spec,test}.{ts,tsx}"],
      languageOptions: {
        globals: {
          ...browserGlobals,
          ...vitestGlobals,
        },
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
