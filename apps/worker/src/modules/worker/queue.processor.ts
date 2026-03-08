import {
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { WORKER_QUEUE_NAME } from "../../config/queue.config";

@Processor(WORKER_QUEUE_NAME, {
  concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
})
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  async process(job: Job<unknown>) {
    this.logger.log(`Received job ${job.id} (${job.name})`);
  }

  @OnWorkerEvent("active")
  onActive(job: Job<unknown>) {
    this.logger.debug(`Job ${job.id} is active`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<unknown>) {
    this.logger.debug(`Job ${job.id} completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<unknown> | undefined, error: Error) {
    this.logger.error(
      `Job ${job?.id ?? "unknown"} failed: ${error.message}`,
      error.stack,
    );
  }
}
