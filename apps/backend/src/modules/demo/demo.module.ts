import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "../background-jobs/background-jobs.module";
import { DemoJobsController } from "./demo-jobs.controller";
import { DemoController } from "./demo.controller";
import { DemoService } from "./demo.service";

@Module({
  imports: [BackgroundJobsModule],
  controllers: [DemoController, DemoJobsController],
  providers: [DemoService],
})
export class DemoModule {}
