import { BACKGROUND_TASKS_QUEUE } from "@repo/jobs";
import { loadEmailConfig } from "./email.config";
import { parseInteger } from "./parsers";
import { loadRedisConfig } from "./redis.config";
import type { WorkerConfig } from "./types";

export const DEFAULT_WORKER_NAME = "tournament-worker";
export const DEFAULT_QUEUE_NAME = BACKGROUND_TASKS_QUEUE.name;
export const DEFAULT_WORKER_CONCURRENCY = 5;

export function loadWorkerConfig(
  env: Record<string, string | undefined>,
): WorkerConfig {
  const concurrency = parseInteger(
    "WORKER_CONCURRENCY",
    env["WORKER_CONCURRENCY"],
    DEFAULT_WORKER_CONCURRENCY,
  );
  const redisQueuePrefix = env["REDIS_QUEUE_PREFIX"] || undefined;

  if (concurrency < 1) {
    throw new Error("WORKER_CONCURRENCY must be greater than 0");
  }

  return {
    workerName: env["WORKER_NAME"] || DEFAULT_WORKER_NAME,
    queueName: env["WORKER_QUEUE_NAME"] || DEFAULT_QUEUE_NAME,
    concurrency,
    redis: loadRedisConfig(env),
    ...(redisQueuePrefix ? { redisQueuePrefix } : {}),
    email: loadEmailConfig(env),
  };
}
