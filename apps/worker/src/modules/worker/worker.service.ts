import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";
import { WORKER_QUEUE_NAME } from "../../config/queue.config";

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    @InjectQueue(WORKER_QUEUE_NAME) private readonly queue: Queue,
  ) {}

  onModuleInit() {
    const workerName = process.env.WORKER_NAME || "tournament-worker";
    const queueName = process.env.WORKER_QUEUE_NAME || WORKER_QUEUE_NAME;

    this.logger.log(
      `${workerName} initialized and subscribed to BullMQ queue "${queueName}"`,
    );
    this.logger.debug(`BullMQ queue ready: ${this.queue.name}`);
  }
}
