import { z } from "zod";
import { defineJob, defineQueue, type InferJobData } from "./definitions";

export const queuedJobResponseSchema = z.object({
  jobId: z.string(),
  queueName: z.string().min(1),
  status: z.literal("queued"),
});

export type QueuedJobResponse = z.infer<typeof queuedJobResponseSchema>;

const emailAddressSchema = z.string().trim().email();

export const sendVerificationEmailJobSchema = z.object({
  email: emailAddressSchema,
  name: z.string().trim().min(1).max(120).optional(),
  productName: z.string().trim().min(1).max(80).optional(),
  verificationUrl: z.string().url(),
  expiresInHours: z.number().int().positive().max(168).optional(),
  supportEmail: emailAddressSchema.optional(),
  idempotencyKey: z.string().trim().min(1).max(256).optional(),
});

export const BACKGROUND_TASKS_QUEUE = defineQueue({
  name: "background-tasks",
  jobs: {
    logMessage: defineJob({
      name: "log.message",
      validate: z.object({
        message: z.string().trim().min(1).max(500),
      }),
    }),
    sendVerificationEmail: defineJob({
      name: "send.verification-email",
      validate: sendVerificationEmailJobSchema,
    }),
  },
});

export const LOG_MESSAGE_JOB = BACKGROUND_TASKS_QUEUE.jobs.logMessage;
export const SEND_VERIFICATION_EMAIL_JOB =
  BACKGROUND_TASKS_QUEUE.jobs.sendVerificationEmail;

export type LogMessageJobData = InferJobData<typeof LOG_MESSAGE_JOB>;
export type SendVerificationEmailJobData = InferJobData<
  typeof SEND_VERIFICATION_EMAIL_JOB
>;
