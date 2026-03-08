import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { WORKER_QUEUE_NAME } from "../../config/queue.config";
import { QueueProcessor } from "./queue.processor";
import { WorkerService } from "./worker.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: WORKER_QUEUE_NAME,
    }),
  ],
  providers: [WorkerService, QueueProcessor],
})
export class WorkerModule {}
