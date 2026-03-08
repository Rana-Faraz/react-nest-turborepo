import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WORKER_QUEUE_NAME } from "./config/queue.config";
import { HealthModule } from "./modules/health/health.module";
import { WorkerModule } from "./modules/worker/worker.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          db: Number(configService.get("REDIS_DB")) || 0,
          host: configService.get("REDIS_HOST") || "localhost",
          password: configService.get("REDIS_PASSWORD") || undefined,
          port: Number(configService.get("REDIS_PORT")) || 6379,
        },
        prefix: configService.get("REDIS_QUEUE_PREFIX") || undefined,
      }),
    }),
    BullModule.registerQueue({
      name: WORKER_QUEUE_NAME,
    }),
    WorkerModule,
    HealthModule,
  ],
})
export class AppModule {}
