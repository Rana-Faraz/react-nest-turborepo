import { createValidationErrorResponse } from "@repo/contracts";
import { BadRequestException, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { HealthModule } from "./modules/health/health.module";
import { typeOrmAsyncConfig } from "./config/typeorm.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import {
  createZodValidationPipe,
  ZodSerializerInterceptor,
} from "nestjs-zod";
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
