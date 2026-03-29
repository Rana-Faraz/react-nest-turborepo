import { BACKGROUND_TASKS_QUEUE } from "@repo/jobs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { BackgroundJobsService } from "./background-jobs.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: BACKGROUND_TASKS_QUEUE.name,
    }),
  ],
  providers: [BackgroundJobsService],
  exports: [BackgroundJobsService],
})
export class BackgroundJobsModule {}
