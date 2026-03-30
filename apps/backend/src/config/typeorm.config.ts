import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import databaseConfig from "./database.config";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (): TypeOrmModuleOptions => databaseConfig,
};
