import { z } from "zod";
import { defineJob, defineQueue, type InferJobData } from "./definitions";

export const queuedJobResponseSchema = z.object({
  jobId: z.string(),
  queueName: z.string().min(1),
  status: z.literal("queued"),
});

export type QueuedJobResponse = z.infer<typeof queuedJobResponseSchema>;

export const BACKGROUND_TASKS_QUEUE = defineQueue({
  name: "background-tasks",
  jobs: {
    logMessage: defineJob({
      name: "log.message",
      validate: z.object({
        message: z.string().trim().min(1).max(500),
      }),
    }),
  },
});

export const LOG_MESSAGE_JOB = BACKGROUND_TASKS_QUEUE.jobs.logMessage;

export type LogMessageJobData = InferJobData<typeof LOG_MESSAGE_JOB>;
