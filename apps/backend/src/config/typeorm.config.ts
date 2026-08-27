import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createDatabaseConfig } from "./database.config.js";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
    createDatabaseConfig((key) => configService.get<string>(key)),
};
