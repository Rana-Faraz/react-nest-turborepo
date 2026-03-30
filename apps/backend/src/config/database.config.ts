import { resolve } from "node:path";
import { ConfigModule } from "@nestjs/config";
import { DataSourceOptions } from "typeorm";

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: resolve(__dirname, "../../.env"),
});

function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

const isLocal = process.env["NODE_ENV"] === "local";
const dbHost = getRequiredEnv("DB_HOST");
const dbUser = getRequiredEnv("DB_USER");
const dbName = getRequiredEnv("DB_NAME");
const dbPassword = process.env["DB_PASSWORD"] || undefined;
const databaseConfig: DataSourceOptions = {
  type: "postgres",
  host: dbHost,
  port: Number(process.env["DB_PORT"]) || 5432,
  username: dbUser,
  ...(dbPassword ? { password: dbPassword } : {}),
  database: dbName,
  entities: [__dirname + "../../**/**/*entity{.ts,.js}"],

  // We are using migrations, synchronize should be set to false.
  synchronize: false,
  migrationsRun: true,
  // "each" wraps every migration in its own transaction (same safety as "all")
  // but allows individual migrations to set `transaction = false` when needed
  // (e.g. CREATE INDEX CONCURRENTLY cannot run inside a transaction).
  migrationsTransactionMode: "each",
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  ...(!isLocal
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
};

export default databaseConfig;
