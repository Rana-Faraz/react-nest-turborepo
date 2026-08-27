import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import type { DataSource } from "typeorm";
import { BackgroundJobsService } from "../modules/background-jobs/background-jobs.service.js";

export function createAuth(
  dataSource: DataSource,
  backgroundJobsService?: BackgroundJobsService,
) {
  const betterAuthSecret = process.env["BETTER_AUTH_SECRET"] || undefined;
  const appName = process.env["APP_NAME"] || undefined;
  const supportEmail = process.env["RESEND_REPLY_TO_EMAIL"] || undefined;
  const options = {
    baseURL: process.env["BETTER_AUTH_URL"] || "http://localhost:3000",
    ...(betterAuthSecret ? { secret: betterAuthSecret } : {}),
    trustedOrigins: [process.env["FRONTEND_URL"] || "http://localhost:5173"],
    database: typeormAdapter(dataSource, {
      enableSchemaSync: false,
    }),
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await backgroundJobsService?.enqueueVerificationEmail({
          email: user.email,
          verificationUrl: url,
          ...(user.name ? { name: user.name } : {}),
          ...(appName ? { productName: appName } : {}),
          ...(supportEmail ? { supportEmail } : {}),
        });
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(options);
}
