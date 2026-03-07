import { resolve } from "node:path";
import { ConfigModule } from "@nestjs/config";
import { DataSourceOptions } from "typeorm";

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: resolve(__dirname, "../../.env"),
});
const IS_DEV = process.env.NODE_ENV === "local";
const databaseConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "../../**/**/*entity{.ts,.js}"],

  // We are using migrations, synchronize should be set to false.
  synchronize: false,
  migrationsRun: true,
  // "each" wraps every migration in its own transaction (same safety as "all")
  // but allows individual migrations to set `transaction = false` when needed
  // (e.g. CREATE INDEX CONCURRENTLY cannot run inside a transaction).
  migrationsTransactionMode: "each",
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  ssl: IS_DEV
    ? undefined
    : {
        rejectUnauthorized: false,
      },
};

export default databaseConfig;
