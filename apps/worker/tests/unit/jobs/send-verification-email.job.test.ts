import { describe, expect, it } from "bun:test";
import { SEND_VERIFICATION_EMAIL_JOB } from "@repo/jobs";
import type { Job } from "bullmq";
import { loadWorkerConfig } from "../../../src/config";
import type {
  ResendClientLike,
  ResendClientProvider,
} from "../../../src/email/resend-email-sender";
import {
  createSendVerificationEmailJobDefinition,
  VerificationEmailJobError,
} from "../../../src/jobs/send-verification-email.job";
import { createLoggerSpy } from "../../helpers/logger-spy";

describe("createSendVerificationEmailJobDefinition", () => {
  it("uses the shared job name", () => {
    const { logger } = createLoggerSpy();
    const jobDefinition = createSendVerificationEmailJobDefinition(
      loadWorkerConfig({
        RESEND_FROM_EMAIL: "noreply@example.com",
      }),
      logger,
      async () => ({
        emails: {
          send: async () => ({
            data: {
              id: "email_verify_123",
            },
          }),
        },
      }),
    );

    expect(jobDefinition.name).toBe(SEND_VERIFICATION_EMAIL_JOB.name);
  });

  it("sends the verification email using the react template payload", async () => {
    const { calls, logger } = createLoggerSpy();
    const sendCalls: Array<{
      payload: Record<string, unknown>;
      options?: {
        idempotencyKey?: string;
      };
    }> = [];
    const getResendClient: ResendClientProvider = async () => ({
      emails: {
        send: async (payload, options) => {
          sendCalls.push({
            payload,
            ...(options ? { options } : {}),
          });

          return {
            data: {
              id: "email_verify_123",
            },
          };
        },
      },
    });
    const jobDefinition = createSendVerificationEmailJobDefinition(
      loadWorkerConfig({
        RESEND_FROM_EMAIL: "noreply@example.com",
        RESEND_REPLY_TO_EMAIL: "support@example.com",
      }),
      logger,
      getResendClient,
    );

    await jobDefinition.handle(
      {
        id: "job-123",
        name: SEND_VERIFICATION_EMAIL_JOB.name,
        data: {
          email: "player@example.com",
          name: "Jordan",
          productName: "Tournament Hub",
          verificationUrl: "https://example.com/verify-email?token=abc123",
          expiresInHours: 12,
          supportEmail: "support@example.com",
        },
        discard() {},
      } as Job<unknown>,
    );

    expect(sendCalls).toHaveLength(1);
    expect(sendCalls[0]?.payload).toMatchObject({
      from: "noreply@example.com",
      to: ["player@example.com"],
      subject: "Verify your email for Tournament Hub",
      replyTo: "support@example.com",
    });
    expect(sendCalls[0]?.payload["react"]).toBeDefined();
    expect(sendCalls[0]?.options).toEqual({
      idempotencyKey: "verification-email/job-123",
    });
    expect(calls.info).toEqual([
      "Sent verification email email_verify_123 for job job-123",
    ]);
  });

  it("discards non-retryable verification send failures", async () => {
    const { calls, logger } = createLoggerSpy();
    let discardCount = 0;
    const getResendClient: ResendClientProvider = async () => ({
      emails: {
        send: async () => ({
          error: {
            name: "validation_error",
            message: "recipient is invalid",
            statusCode: 422,
          },
        }),
      },
    });
    const jobDefinition = createSendVerificationEmailJobDefinition(
      loadWorkerConfig({
        RESEND_FROM_EMAIL: "noreply@example.com",
      }),
      logger,
      getResendClient,
    );

    await expect(
      jobDefinition.handle(
        {
          id: "job-456",
          name: SEND_VERIFICATION_EMAIL_JOB.name,
          data: {
            email: "player@example.com",
            verificationUrl: "https://example.com/verify-email?token=abc123",
          },
          discard() {
            discardCount += 1;
          },
        } as Job<unknown>,
      ),
    ).rejects.toThrow("recipient is invalid");

    expect(discardCount).toBe(1);
    expect(calls.error).toEqual([
      {
        message:
          "Failed to process verification email job job-456: Failed to send verification email via Resend (verification-email/job-456): recipient is invalid",
        error: expect.any(VerificationEmailJobError),
      },
    ]);
  });

  it("keeps rate-limited sends retryable", async () => {
    const { calls, logger } = createLoggerSpy();
    let discardCount = 0;
    const getResendClient: ResendClientProvider = async () => ({
      emails: {
        send: async () => ({
          error: {
            name: "rate_limit_exceeded",
            message: "slow down",
            statusCode: 429,
          },
        }),
      },
    });
    const jobDefinition = createSendVerificationEmailJobDefinition(
      loadWorkerConfig({
        RESEND_FROM_EMAIL: "noreply@example.com",
      }),
      logger,
      getResendClient,
    );

    await expect(
      jobDefinition.handle(
        {
          id: "job-789",
          name: SEND_VERIFICATION_EMAIL_JOB.name,
          data: {
            email: "player@example.com",
            verificationUrl: "https://example.com/verify-email?token=abc123",
          },
          discard() {
            discardCount += 1;
          },
        } as Job<unknown>,
      ),
    ).rejects.toThrow("slow down");

    expect(discardCount).toBe(0);
    expect(calls.error).toEqual([
      {
        message:
          "Failed to process verification email job job-789: Failed to send verification email via Resend (verification-email/job-789): slow down",
        error: expect.any(VerificationEmailJobError),
      },
    ]);
  });

  it("fails fast when the from email is missing", async () => {
    const { calls, logger } = createLoggerSpy();
    let discardCount = 0;
    const getResendClient: ResendClientProvider = async () =>
      ({
        emails: {
          send: async () => ({
            data: {
              id: "unused",
            },
          }),
        },
      }) satisfies ResendClientLike;
    const jobDefinition = createSendVerificationEmailJobDefinition(
      loadWorkerConfig({}),
      logger,
      getResendClient,
    );

    await expect(
      jobDefinition.handle(
        {
          id: "job-999",
          name: SEND_VERIFICATION_EMAIL_JOB.name,
          data: {
            email: "player@example.com",
            verificationUrl: "https://example.com/verify-email?token=abc123",
          },
          discard() {
            discardCount += 1;
          },
        } as Job<unknown>,
      ),
    ).rejects.toThrow("RESEND_FROM_EMAIL is required to send verification emails");

    expect(discardCount).toBe(1);
    expect(calls.error).toEqual([
      {
        message:
          "Failed to process verification email job job-999: RESEND_FROM_EMAIL is required to send verification emails",
        error: expect.any(VerificationEmailJobError),
      },
    ]);
  });

  it("discards initialization failures such as a missing api key", async () => {
    const { calls, logger } = createLoggerSpy();
    let discardCount = 0;
    const getResendClient: ResendClientProvider = async () => {
      throw new Error("RESEND_API_KEY is required to initialize Resend");
    };
    const jobDefinition = createSendVerificationEmailJobDefinition(
      loadWorkerConfig({
        RESEND_FROM_EMAIL: "noreply@example.com",
      }),
      logger,
      getResendClient,
    );

    await expect(
      jobDefinition.handle(
        {
          id: "job-1000",
          name: SEND_VERIFICATION_EMAIL_JOB.name,
          data: {
            email: "player@example.com",
            verificationUrl: "https://example.com/verify-email?token=abc123",
          },
          discard() {
            discardCount += 1;
          },
        } as Job<unknown>,
      ),
    ).rejects.toThrow("RESEND_API_KEY is required to initialize Resend");

    expect(discardCount).toBe(1);
    expect(calls.error).toEqual([
      {
        message:
          "Failed to process verification email job job-1000: RESEND_API_KEY is required to initialize Resend",
        error: expect.any(VerificationEmailJobError),
      },
    ]);
  });
});
