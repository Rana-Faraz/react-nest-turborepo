import { describe, expect, it } from "bun:test";
import {
  DEFAULT_QUEUE_NAME,
  DEFAULT_REDIS_DB,
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_WORKER_CONCURRENCY,
  DEFAULT_WORKER_NAME,
  loadWorkerConfig,
} from "../../src/config";

describe("loadWorkerConfig", () => {
  it("uses the expected defaults", () => {
    const config = loadWorkerConfig({});

    expect(config).toEqual({
      workerName: DEFAULT_WORKER_NAME,
      queueName: DEFAULT_QUEUE_NAME,
      concurrency: DEFAULT_WORKER_CONCURRENCY,
      redis: {
        host: DEFAULT_REDIS_HOST,
        port: DEFAULT_REDIS_PORT,
        db: DEFAULT_REDIS_DB,
        password: undefined,
      },
      redisQueuePrefix: undefined,
    });
  });

  it("honors environment overrides", () => {
    const config = loadWorkerConfig({
      WORKER_NAME: "matchmaker",
      WORKER_QUEUE_NAME: "custom-jobs",
      WORKER_CONCURRENCY: "9",
      REDIS_HOST: "redis.internal",
      REDIS_PORT: "6380",
      REDIS_DB: "2",
      REDIS_PASSWORD: "secret",
      REDIS_QUEUE_PREFIX: "prod",
    });

    expect(config).toEqual({
      workerName: "matchmaker",
      queueName: "custom-jobs",
      concurrency: 9,
      redis: {
        host: "redis.internal",
        port: 6380,
        db: 2,
        password: "secret",
      },
      redisQueuePrefix: "prod",
    });
  });

  it("rejects invalid numeric configuration", () => {
    expect(() =>
      loadWorkerConfig({
        WORKER_CONCURRENCY: "0",
      }),
    ).toThrow("WORKER_CONCURRENCY must be greater than 0");

    expect(() =>
      loadWorkerConfig({
        REDIS_PORT: "abc",
      }),
    ).toThrow("REDIS_PORT must be a valid integer");
  });
});
