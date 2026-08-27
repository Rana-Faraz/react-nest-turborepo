import { BullModule } from "@nestjs/bullmq";
import { Module, StandardSchemaSerializerInterceptor } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppValidationPipe } from "./common/http/app-validation.pipe.js";
import { typeOrmAsyncConfig } from "./config/typeorm.config.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { BackgroundJobsModule } from "./modules/background-jobs/background-jobs.module.js";
import { DemoModule } from "./modules/demo/demo.module.js";
import { HealthModule } from "./modules/health/health.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisPassword =
          configService.get<string>("REDIS_PASSWORD") || undefined;
        const redisQueuePrefix =
          configService.get<string>("REDIS_QUEUE_PREFIX") || undefined;

        return {
          connection: {
            db: Number(configService.get("REDIS_DB")) || 0,
            host: configService.get("REDIS_HOST") || "localhost",
            port: Number(configService.get("REDIS_PORT")) || 6379,
            ...(redisPassword ? { password: redisPassword } : {}),
          },
          ...(redisQueuePrefix ? { prefix: redisQueuePrefix } : {}),
        };
      },
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    BackgroundJobsModule,
    AuthModule,
    DemoModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: AppValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: StandardSchemaSerializerInterceptor,
    },
  ],
})
export class AppModule {}
