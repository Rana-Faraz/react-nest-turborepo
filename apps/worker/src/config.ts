export const DEFAULT_WORKER_NAME = "tournament-worker";
import { BACKGROUND_TASKS_QUEUE } from "@repo/jobs";

export const DEFAULT_QUEUE_NAME = BACKGROUND_TASKS_QUEUE.name;
export const DEFAULT_REDIS_HOST = "localhost";
export const DEFAULT_REDIS_PORT = 6379;
export const DEFAULT_REDIS_DB = 0;
export const DEFAULT_WORKER_CONCURRENCY = 5;

export interface WorkerConfig {
  workerName: string;
  queueName: string;
  concurrency: number;
  redis: {
    host: string;
    port: number;
    db: number;
    password?: string;
  };
  redisQueuePrefix?: string;
}

function parseInteger(
  key: string,
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} must be a valid integer`);
  }

  return parsed;
}

export function loadWorkerConfig(
  env: Record<string, string | undefined>,
): WorkerConfig {
  const concurrency = parseInteger(
    "WORKER_CONCURRENCY",
    env.WORKER_CONCURRENCY,
    DEFAULT_WORKER_CONCURRENCY,
  );

  if (concurrency < 1) {
    throw new Error("WORKER_CONCURRENCY must be greater than 0");
  }

  const port = parseInteger("REDIS_PORT", env.REDIS_PORT, DEFAULT_REDIS_PORT);
  const db = parseInteger("REDIS_DB", env.REDIS_DB, DEFAULT_REDIS_DB);

  if (port < 1) {
    throw new Error("REDIS_PORT must be greater than 0");
  }

  if (db < 0) {
    throw new Error("REDIS_DB must be 0 or greater");
  }

  return {
    workerName: env.WORKER_NAME || DEFAULT_WORKER_NAME,
    queueName: env.WORKER_QUEUE_NAME || DEFAULT_QUEUE_NAME,
    concurrency,
    redis: {
      host: env.REDIS_HOST || DEFAULT_REDIS_HOST,
      port,
      db,
      password: env.REDIS_PASSWORD || undefined,
    },
    redisQueuePrefix: env.REDIS_QUEUE_PREFIX || undefined,
  };
}
