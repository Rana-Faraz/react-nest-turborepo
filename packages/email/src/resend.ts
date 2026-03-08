import { Resend } from "resend";
import type {
  AppEmailMessage,
  AppEmailSender,
  CreateResendEmailSenderOptions,
} from "./types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Unknown Resend error";
}

export function createResendEmailSender({
  apiKey,
}: CreateResendEmailSenderOptions): AppEmailSender {
  const resend = new Resend(apiKey);

  return {
    async send(message: AppEmailMessage) {
      const { error } = await resend.emails.send(message);

      if (error) {
        throw new Error(
          `Failed to send email with Resend: ${getErrorMessage(error)}`,
        );
      }
    },
  };
}
