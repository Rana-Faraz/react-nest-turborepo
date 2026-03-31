import { describe, expect, it } from "bun:test";
import { loadWorkerConfig } from "../../../src/config";
import { createResendClientProvider } from "../../../src/email/resend-email-sender";

describe("createResendClientProvider", () => {
  it("initializes the Resend client once and reuses it", async () => {
    const createdClients: string[] = [];
    const getClient = createResendClientProvider(
      loadWorkerConfig({
        RESEND_API_KEY: "re_test_123",
      }),
      async (apiKey) => {
        createdClients.push(apiKey);

        return {
          emails: {
            send: async () => ({
              data: {
                id: "email_123",
              },
            }),
          },
        };
      },
    );

    const first = await getClient();
    const second = await getClient();

    expect(createdClients).toEqual(["re_test_123"]);
    expect(first).toBe(second);
  });

  it("fails when the resend api key is missing", async () => {
    const getClient = createResendClientProvider(loadWorkerConfig({}));

    await expect(getClient()).rejects.toThrow(
      "RESEND_API_KEY is required to initialize Resend",
    );
  });
});
