import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DataSourceOptions } from "typeorm";
import { Account } from "../entities/Account.js";
import { Session } from "../entities/Session.js";
import { User } from "../entities/User.js";
import { Verification } from "../entities/Verification.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export type EnvironmentReader = (key: string) => string | undefined;

function getRequiredEnv(readEnv: EnvironmentReader, key: string): string {
  const value = readEnv(key);

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export function createDatabaseConfig(
  readEnv: EnvironmentReader = (key) => process.env[key],
): DataSourceOptions {
  const dbPassword = readEnv("DB_PASSWORD") || undefined;
  const isProduction = readEnv("NODE_ENV") === "production";

  return {
    type: "postgres",
    host: getRequiredEnv(readEnv, "DB_HOST"),
    port: Number(readEnv("DB_PORT")) || 5432,
    username: getRequiredEnv(readEnv, "DB_USER"),
    ...(dbPassword ? { password: dbPassword } : {}),
    database: getRequiredEnv(readEnv, "DB_NAME"),
    entities: [Account, Session, User, Verification],
    synchronize: false,
    migrationsRun: true,
    migrationsTransactionMode: "each",
    migrations: [join(currentDirectory, "../migrations/*{.ts,.js}")],
    ...(isProduction
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  };
}
