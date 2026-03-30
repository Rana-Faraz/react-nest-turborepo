import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { AppDataSource } from "../config/datasource.config";
import { betterAuth } from "better-auth";

const betterAuthSecret = process.env["BETTER_AUTH_SECRET"] || undefined;

export const auth = betterAuth({
  baseURL: process.env["BETTER_AUTH_URL"] || "http://localhost:3000",
  ...(betterAuthSecret ? { secret: betterAuthSecret } : {}),
  trustedOrigins: [process.env["FRONTEND_URL"] || "http://localhost:5173"],
  database: typeormAdapter(AppDataSource, {
    migrationsDir: "./apps/backend/src/migrations", // Migrations directory (default: "{outputDir}/migrations")
    entitiesDir: "./apps/backend/src/entities", // Entities directory (default: "{outputDir}/entities")
  }),
  emailAndPassword: {
    enabled: true,
  },
});
