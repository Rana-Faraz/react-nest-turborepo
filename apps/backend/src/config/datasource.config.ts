import { resolve } from "node:path";
import { ConfigModule } from "@nestjs/config";
import { DataSource } from "typeorm";
import { createDatabaseConfig } from "./database.config.js";

// This file is the standalone TypeORM CLI entrypoint. Runtime code receives
// Nest's managed DataSource and never imports this second instance.
ConfigModule.forRoot({
  envFilePath: resolve(process.cwd(), ".env"),
});

export const AppDataSource = new DataSource(createDatabaseConfig());
