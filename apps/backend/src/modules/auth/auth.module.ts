import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "../background-jobs/background-jobs.module.js";
import { BetterAuthService } from "./better-auth.service.js";

@Module({
  imports: [BackgroundJobsModule],
  providers: [BetterAuthService],
  exports: [BetterAuthService],
})
export class AuthModule {}
