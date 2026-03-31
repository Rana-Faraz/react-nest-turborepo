import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { betterAuth } from "better-auth";
import { AppDataSource } from "../config/datasource.config";
import { BackgroundJobsService } from "../modules/background-jobs/background-jobs.service";

const betterAuthSecret = process.env["BETTER_AUTH_SECRET"] || undefined;
const appName = process.env["APP_NAME"] || undefined;
const supportEmail = process.env["RESEND_REPLY_TO_EMAIL"] || undefined;

export function createAuth(backgroundJobsService?: BackgroundJobsService) {
  const options = {
    baseURL: process.env["BETTER_AUTH_URL"] || "http://localhost:3000",
    ...(betterAuthSecret ? { secret: betterAuthSecret } : {}),
    trustedOrigins: [process.env["FRONTEND_URL"] || "http://localhost:5173"],
    database: typeormAdapter(AppDataSource, {
      migrationsDir: "./apps/backend/src/migrations",
      entitiesDir: "./apps/backend/src/entities",
    }),
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: { email: string; name?: string | null };
        url: string;
      }) => {
        await backgroundJobsService?.enqueueVerificationEmail({
          email: user.email,
          verificationUrl: url,
          ...(user.name ? { name: user.name } : {}),
          ...(appName ? { productName: appName } : {}),
          ...(supportEmail ? { supportEmail } : {}),
        });
      },
    },
  };

  return betterAuth(options);
}
