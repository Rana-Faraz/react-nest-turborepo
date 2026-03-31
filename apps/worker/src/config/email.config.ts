import type { WorkerEmailConfig } from "./types";

export function loadEmailConfig(
  env: Record<string, string | undefined>,
): WorkerEmailConfig {
  const resendApiKey = env["RESEND_API_KEY"] || undefined;
  const from = env["RESEND_FROM_EMAIL"] || undefined;
  const replyTo = env["RESEND_REPLY_TO_EMAIL"] || undefined;

  return {
    ...(resendApiKey ? { resendApiKey } : {}),
    ...(from ? { from } : {}),
    ...(replyTo ? { replyTo } : {}),
  };
}
