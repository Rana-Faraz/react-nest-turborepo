import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactCompiler from "eslint-plugin-react-compiler";
import react from "eslint-plugin-react";
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
        react,
        "react-compiler": reactCompiler,
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh,
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        "react-compiler/react-compiler": "error",
        "react-refresh/only-export-components": [
          "warn",
          { allowConstantExport: true, allowExportNames: ["Route", "router"] },
        ],
        "react/jsx-key": "error",
        "react/jsx-no-duplicate-props": "error",
      },
    },
    {
      files: ["src/router.tsx", "src/routes/**/*.tsx"],
      rules: {
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
