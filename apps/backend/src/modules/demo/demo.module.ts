import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "../background-jobs/background-jobs.module.js";
import { DemoJobsController } from "./demo-jobs.controller.js";
import { DemoController } from "./demo.controller.js";
import { DemoService } from "./demo.service.js";

@Module({
  imports: [BackgroundJobsModule],
  controllers: [DemoController, DemoJobsController],
  providers: [DemoService],
})
export class DemoModule {}
