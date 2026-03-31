import { describe, expect, it } from "bun:test";
import { type Job } from "bullmq";
import { loadWorkerConfig } from "../../src/config";
import { createJobHandler, registerWorkerEventLogging } from "../../src/worker";
import { createFakeWorkerEventTarget } from "../helpers/fake-worker";
import { createLoggerSpy } from "../helpers/logger-spy";

describe("createJobHandler", () => {
  it("logs the received job details", async () => {
    const { calls, logger } = createLoggerSpy();
    const handler = createJobHandler(loadWorkerConfig({}), logger);

    await handler({
      id: "42",
      name: "rebuild-bracket",
      data: undefined,
    } as Job<unknown>);

    expect(calls.info).toEqual(["Received job 42 (rebuild-bracket)"]);
  });
});

describe("registerWorkerEventLogging", () => {
  it("subscribes to the expected BullMQ events", () => {
    const { logger } = createLoggerSpy();
    const fakeWorker = createFakeWorkerEventTarget();

    registerWorkerEventLogging(fakeWorker.target, logger);

    expect(fakeWorker.events).toEqual([
      "active",
      "completed",
      "failed",
      "error",
    ]);
    expect(fakeWorker.listeners.size).toBe(4);
  });

  it("logs each BullMQ lifecycle event through the provided logger", () => {
    const { calls, logger } = createLoggerSpy();
    const fakeWorker = createFakeWorkerEventTarget();

    registerWorkerEventLogging(fakeWorker.target, logger);

    const job = { id: "job-17", name: "sync-rankings" } as Pick<
      Job<unknown>,
      "id" | "name"
    > as Job<unknown>;
    const error = new Error("boom");

    fakeWorker.listeners.get("active")?.(job);
    fakeWorker.listeners.get("completed")?.(job);
    fakeWorker.listeners.get("failed")?.(job, error);
    fakeWorker.listeners.get("error")?.(error);

    expect(calls.debug).toEqual([
      "Job job-17 is active",
      "Job job-17 completed",
    ]);
    expect(calls.error).toEqual([
      {
        message: "Job job-17 failed: boom",
        error,
      },
      {
        message: "Worker error: boom",
        error,
      },
    ]);
  });
});
