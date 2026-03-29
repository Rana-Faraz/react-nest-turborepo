import { describe, expect, it } from "bun:test";
import { LOG_MESSAGE_JOB } from "@repo/jobs";
import type { Job } from "bullmq";
import { createLogMessageJobDefinition } from "../../../src/jobs/log-message.job";
import { createLoggerSpy } from "../../helpers/logger-spy";

describe("createLogMessageJobDefinition", () => {
  it("uses the shared job name", () => {
    const { logger } = createLoggerSpy();
    const jobDefinition = createLogMessageJobDefinition(logger);

    expect(jobDefinition.name).toBe(LOG_MESSAGE_JOB.name);
  });

  it("logs the validated message payload", async () => {
    const { calls, logger } = createLoggerSpy();
    const jobDefinition = createLogMessageJobDefinition(logger);

    await jobDefinition.handle(
      {
        id: "43",
        name: LOG_MESSAGE_JOB.name,
        data: { message: "hello from bullmq" },
      } as Job<unknown>,
    );

    expect(calls.info).toEqual(["hello from bullmq"]);
  });
});
