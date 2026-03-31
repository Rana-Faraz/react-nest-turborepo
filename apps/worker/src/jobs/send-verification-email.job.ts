import { VerificationEmail } from "@repo/emails";
import {
  SEND_VERIFICATION_EMAIL_JOB,
  type SendVerificationEmailJobData,
} from "@repo/jobs";
import { createElement } from "react";
import type { WorkerConfig } from "../config";
import type { ResendClientProvider } from "../email/resend-email-sender";
import type { WorkerLogger } from "../worker";
import type { WorkerJob, WorkerJobDefinition } from "./types";

class VerificationEmailJobError extends Error {
  constructor(
    message: string,
    readonly options: {
      retryable: boolean;
      cause?: unknown;
    },
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "VerificationEmailJobError";
  }

  get retryable() {
    return this.options.retryable;
  }
}

interface ResendErrorLike {
  name?: string;
  message?: string;
  statusCode?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toResendErrorLike(error: unknown): ResendErrorLike {
  if (!isRecord(error)) {
    return {};
  }

  return {
    ...(typeof error["name"] === "string" ? { name: error["name"] } : {}),
    ...(typeof error["message"] === "string"
      ? { message: error["message"] }
      : {}),
    ...(typeof error["statusCode"] === "number"
      ? { statusCode: error["statusCode"] }
      : {}),
  };
}

function isRetryableResendError(error: unknown): boolean {
  const resendError = toResendErrorLike(error);

  if (resendError.name === "rate_limit_exceeded") {
    return true;
  }

  if (resendError.name === "api_error") {
    return true;
  }

  if (resendError.name === "concurrent_idempotent_requests") {
    return true;
  }

  return resendError.statusCode === 429 || resendError.statusCode === 500;
}

function buildResendErrorMessage(error: unknown, idempotencyKey: string): string {
  const resendError = toResendErrorLike(error);
  const reason = resendError.message ?? "Unknown Resend API error";

  return `Failed to send verification email via Resend (${idempotencyKey}): ${reason}`;
}

function resolveVerificationIdempotencyKey(
  payload: SendVerificationEmailJobData,
  jobId?: string,
): string {
  if (payload.idempotencyKey) {
    return payload.idempotencyKey;
  }

  if (!jobId) {
    throw new VerificationEmailJobError(
      "Verification email jobs require either an explicit idempotencyKey or a BullMQ job id",
      { retryable: false },
    );
  }

  return `verification-email/${jobId}`;
}

function resolveFromEmail(config: WorkerConfig): string {
  const from = config.email.from;

  if (!from) {
    throw new VerificationEmailJobError(
      "RESEND_FROM_EMAIL is required to send verification emails",
      { retryable: false },
    );
  }

  return from;
}

async function resolveResendClient(
  getResendClient: ResendClientProvider,
): Promise<Awaited<ReturnType<ResendClientProvider>>> {
  try {
    return await getResendClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize Resend";

    throw new VerificationEmailJobError(message, {
      retryable: false,
      cause: error,
    });
  }
}

export function createSendVerificationEmailJobDefinition(
  config: WorkerConfig,
  logger: WorkerLogger,
  getResendClient: ResendClientProvider,
): WorkerJobDefinition {
  return {
    name: SEND_VERIFICATION_EMAIL_JOB.name,
    handle: async (job: WorkerJob) => {
      const data = SEND_VERIFICATION_EMAIL_JOB.validate.parse(job.data);

      try {
        const from = resolveFromEmail(config);
        const resend = await resolveResendClient(getResendClient);
        const idempotencyKey = resolveVerificationIdempotencyKey(
          data,
          job.id ? String(job.id) : undefined,
        );
        const productName = data.productName ?? "Tournament Hub";
        const { data: response, error } = await resend.emails.send(
          {
            from,
            to: [data.email],
            subject: `Verify your email for ${productName}`,
            ...(config.email.replyTo ? { replyTo: config.email.replyTo } : {}),
            react: createElement(VerificationEmail, {
              productName,
              verificationUrl: data.verificationUrl,
              ...(data.name ? { name: data.name } : {}),
              ...(data.expiresInHours
                ? { expiresInHours: data.expiresInHours }
                : {}),
              ...(data.supportEmail
                ? { supportEmail: data.supportEmail }
                : {}),
            }),
          },
          {
            idempotencyKey,
          },
        );

        if (error) {
          throw new VerificationEmailJobError(
            buildResendErrorMessage(error, idempotencyKey),
            {
              retryable: isRetryableResendError(error),
              cause: error,
            },
          );
        }

        const emailId = response?.id;

        if (!emailId) {
          throw new VerificationEmailJobError(
            `Resend did not return an email id for verification email ${idempotencyKey}`,
            { retryable: true },
          );
        }

        logger.info(`Sent verification email ${emailId} for job ${job.id}`);
      } catch (error) {
        if (error instanceof VerificationEmailJobError && !error.retryable) {
          job.discard();
        }

        const message =
          error instanceof Error ? error.message : "Unknown email send failure";
        logger.error(
          `Failed to process verification email job ${job.id ?? "unknown"}: ${message}`,
          error,
        );

        throw error;
      }
    },
  };
}

export { VerificationEmailJobError };
