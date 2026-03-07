import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { createAppAuth } from "@repo/auth";
import { AppDataSource } from "../config/datasource.config";

export const auth = createAppAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || undefined,
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
  database: typeormAdapter(AppDataSource, {
    migrationsDir: "./apps/backend/src/migrations", // Migrations directory (default: "{outputDir}/migrations")
    entitiesDir: "./apps/backend/src/entities", // Entities directory (default: "{outputDir}/entities")
  }),
  emailAndPassword: {
    enabled: true,
  },
});
