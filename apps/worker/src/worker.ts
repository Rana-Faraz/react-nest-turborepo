import { type WorkerListener as BullMQWorkerListener, Worker } from "bullmq";
import type { WorkerConfig } from "./config";
import { createWorkerJobHandler } from "./jobs";

export interface WorkerLogger {
  info(message: string): void;
  debug(message: string): void;
  error(message: string, error?: unknown): void;
}

export const defaultWorkerLogger: WorkerLogger = {
  info: (message) => {
    console.info(message);
  },
  debug: (message) => {
    console.debug(message);
  },
  error: (message, error) => {
    console.error(message, error);
  },
};

export function createJobHandler(logger: WorkerLogger) {
  return createWorkerJobHandler(logger);
}

export type WorkerEventName = "active" | "completed" | "failed" | "error";

export type WorkerEventListeners = Pick<
  BullMQWorkerListener<unknown, void, string>,
  WorkerEventName
>;

export interface WorkerEventTarget {
  on(event: "active", listener: WorkerEventListeners["active"]): unknown;
  on(event: "completed", listener: WorkerEventListeners["completed"]): unknown;
  on(event: "failed", listener: WorkerEventListeners["failed"]): unknown;
  on(event: "error", listener: WorkerEventListeners["error"]): unknown;
}

export function registerWorkerEventLogging(
  worker: WorkerEventTarget,
  logger: WorkerLogger,
) {
  worker.on("active", (job) => {
    logger.debug(`Job ${job.id} is active`);
  });

  worker.on("completed", (job) => {
    logger.debug(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Job ${job?.id ?? "unknown"} failed: ${error.message}`, error);
  });

  worker.on("error", (error) => {
    logger.error(`Worker error: ${error.message}`, error);
  });
}

export function createBackgroundWorker(
  config: WorkerConfig,
  logger: WorkerLogger = defaultWorkerLogger,
) {
  const worker = new Worker(config.queueName, createJobHandler(logger), {
    concurrency: config.concurrency,
    connection: config.redis,
    ...(config.redisQueuePrefix ? { prefix: config.redisQueuePrefix } : {}),
  });

  registerWorkerEventLogging(worker, logger);

  return worker;
}
