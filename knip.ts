import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreFiles: [
    "apps/web/src/routeTree.gen.ts",
    "packages/email/.react-email/**",
  ],
  workspaces: {
    "apps/web": {
      entry: ["src/lib/auth-client.ts"],
      project: ["src/**/*.ts", "src/**/*.tsx"],
      ignoreDependencies: [
        "@tailwindcss/typography",
        "tailwindcss",
        "tailwindcss-animate",
      ],
    },
    "apps/backend": {
      entry: [
        "jest-e2e.config.js",
        "migration.ts",
        "src/entities/**/*.ts",
        "src/main.ts",
        "src/migrations/**/*.ts",
      ],
      project: ["src/**/*.ts", "*.js"],
      ignoreDependencies: [
        "@nestjs/testing",
        "eslint-config-prettier",
        "prettier",
        "source-map-support",
        "ts-loader",
      ],
    },
    "packages/email": {
      entry: ["emails/**/*.tsx"],
      project: ["emails/**/*.tsx"],
      ignoreDependencies: [
        "@react-email/preview-server",
        "@types/react",
        "@types/react-dom",
      ],
    },
  },
};

export default config;
