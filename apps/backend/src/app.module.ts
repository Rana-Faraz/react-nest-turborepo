import { createValidationErrorResponse } from "@repo/contracts";
import { BullModule } from "@nestjs/bullmq";
import { BadRequestException, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { HealthModule } from "./modules/health/health.module";
import { typeOrmAsyncConfig } from "./config/typeorm.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { createZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { ZodError } from "zod";
import { auth } from "./lib/auth";
import { DemoModule } from "./modules/demo/demo.module";

const AppZodValidationPipe = createZodValidationPipe({
  createValidationException: (error) => {
    const issues = error instanceof ZodError ? error.issues : [];

    return new BadRequestException(createValidationErrorResponse(issues));
  },
  strictSchemaDeclaration: true,
});

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
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
    DemoModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: AppZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
