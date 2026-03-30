import js from "@eslint/js";
import importX from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import noOnlyTests from "eslint-plugin-no-only-tests";
import promise from "eslint-plugin-promise";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";
import vitest from "eslint-plugin-vitest";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * @typedef {object} CreateBaseConfigOptions
 * @property {string | undefined} [tsconfigRootDir]
 * @property {unknown[]} [extraConfigs]
 * @property {Record<string, boolean | "readonly" | "writable">} [extraGlobals]
 * @property {string[]} [ignores]
 */

const DEFAULT_IGNORES = [
  "**/.next/**",
  "**/.react-email/**",
  "**/.turbo/**",
  "**/*.d.mts",
  "**/*.d.ts",
  "**/build/**",
  "**/coverage/**",
  "**/dist/**",
  "**/migration.ts",
  "**/node_modules/**",
  "**/routeTree.gen.ts",
  "**/tsup.config.ts",
  "**/vite.config.ts",
];

const sharedExtends = /** @type {unknown[]} */ ([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  promise.configs?.["flat/recommended"] ?? {},
]);

export const browserGlobals = globals.browser;
export const jestGlobals = globals.jest;
export const noOnlyTestsPlugin = noOnlyTests;
export const nodeGlobals = globals.node;
export const vitestGlobals = globals.vitest;
export const jestPlugin = jest;
export const vitestPlugin = vitest;

/**
 * @param {CreateBaseConfigOptions} [options]
 */
export function createBaseConfig(
  {
    tsconfigRootDir,
    extraConfigs = [],
    extraGlobals = {},
    ignores = [],
  } = /** @type {CreateBaseConfigOptions} */ ({}),
) {
  return tseslint.config(
    {
      ignores: [...DEFAULT_IGNORES, ...ignores],
      linterOptions: {
        reportUnusedDisableDirectives: "error",
      },
    },
    {
      extends: /** @type {any[]} */ (sharedExtends),
      files: ["**/*.{ts,tsx,mts,cts}"],
      languageOptions: {
        ecmaVersion: "latest",
        globals: extraGlobals,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          projectService: true,
          ...(tsconfigRootDir ? { tsconfigRootDir } : {}),
        },
      },
      plugins: {
        "import-x": importX,
        security,
        sonarjs,
        "unused-imports": unusedImports,
      },
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "import-x/first": "error",
        "import-x/no-duplicates": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@repo/*/*"],
                message:
                  "Import workspace packages through their public entrypoint instead of deep internal paths.",
              },
            ],
          },
        ],
        "promise/catch-or-return": "error",
        "promise/no-promise-in-callback": "off",
        "promise/no-return-wrap": "error",
        "promise/param-names": "error",
        "security/detect-non-literal-fs-filename": "warn",
        "security/detect-non-literal-regexp": "warn",
        "security/detect-object-injection": "off",
        "security/detect-unsafe-regex": "warn",
        "sonarjs/no-duplicate-string": "off",
        "sonarjs/no-identical-functions": "warn",
        "sonarjs/no-redundant-boolean": "error",
        "sonarjs/prefer-immediate-return": "warn",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            args: "after-used",
            argsIgnorePattern: "^_",
            vars: "all",
            varsIgnorePattern: "^_",
          },
        ],
      },
    },
    .../** @type {any[]} */ (extraConfigs),
  );
}
