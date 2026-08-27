import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreFiles: [
    "apps/web/src/routeTree.gen.ts",
    "packages/email/.react-email/**",
  ],
  workspaces: {
    "apps/web": {
      entry: ["src/lib/auth-client.ts"],
      project: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css"],
    },
    "apps/backend": {
      entry: [
        "src/config/datasource.config.ts",
        "src/entities/**/*.ts",
        "src/main.ts",
        "src/migrations/**/*.ts",
      ],
      project: ["src/**/*.ts"],
    },
    "packages/email": {
      entry: ["emails/**/*.tsx"],
      project: ["emails/**/*.tsx"],
    },
  },
};

export default config;
