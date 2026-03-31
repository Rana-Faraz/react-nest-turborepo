import type { WorkerConfig } from "../config";

export interface ResendSendResponse {
  data?: {
    id?: string;
  } | null;
  error?: unknown;
}

export interface ResendClientLike {
  emails: {
    send(
      payload: Record<string, unknown>,
      options?: {
        idempotencyKey?: string;
      },
    ): Promise<ResendSendResponse>;
  };
}

export type ResendClientProvider = () => Promise<ResendClientLike>;

async function initializeResendSdk(apiKey: string): Promise<ResendClientLike> {
  const { Resend } = await import("resend");
  return new Resend(apiKey) as unknown as ResendClientLike;
}

export function createResendClientProvider(
  config: WorkerConfig,
  clientFactory: (apiKey: string) => Promise<ResendClientLike> = initializeResendSdk,
): ResendClientProvider {
  let clientPromise: Promise<ResendClientLike> | undefined;

  return async () => {
    if (!config.email.resendApiKey) {
      throw new Error("RESEND_API_KEY is required to initialize Resend");
    }

    clientPromise ??= clientFactory(config.email.resendApiKey);

    return clientPromise;
  };
}
