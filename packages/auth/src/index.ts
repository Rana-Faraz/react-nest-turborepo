import { betterAuth, type BetterAuthOptions } from "better-auth";
import {
  createResendAuthEmailService,
  type CreateResendAuthEmailServiceOptions,
} from "@repo/email";

export interface AppAuthEmailSender {
  sendResetPassword: NonNullable<
    NonNullable<BetterAuthOptions["emailAndPassword"]>["sendResetPassword"]
  >;
  sendVerificationEmail: NonNullable<
    NonNullable<BetterAuthOptions["emailVerification"]>["sendVerificationEmail"]
  >;
}

export type AppAuthEmailConfig =
  | {
      mode?: "custom";
      sendOnSignUp?: boolean;
      sender: AppAuthEmailSender;
    }
  | ({
      mode: "resend";
      sendOnSignUp?: boolean;
    } & CreateResendAuthEmailServiceOptions);

export interface CreateAppAuthOptions extends BetterAuthOptions {
  email?: AppAuthEmailConfig;
}

function resolveEmailConfig(email?: AppAuthEmailConfig) {
  if (!email) {
    return null;
  }

  if (email.mode === "resend") {
    const { sendOnSignUp, ...options } = email;

    return {
      sendOnSignUp,
      sender: createResendAuthEmailService(options),
    };
  }

  return {
    sendOnSignUp: email.sendOnSignUp,
    sender: email.sender,
  };
}

export function createAppAuth({ email, ...options }: CreateAppAuthOptions) {
  const resolvedEmail = resolveEmailConfig(email);
  const emailAndPassword = options.emailAndPassword
    ? {
        ...options.emailAndPassword,
        sendResetPassword:
          options.emailAndPassword.sendResetPassword ??
          resolvedEmail?.sender.sendResetPassword,
      }
    : options.emailAndPassword;

  return betterAuth({
    ...options,
    emailAndPassword,
    emailVerification: resolvedEmail
      ? {
          ...options.emailVerification,
          sendOnSignUp:
            options.emailVerification?.sendOnSignUp ??
            resolvedEmail.sendOnSignUp ??
            true,
          sendVerificationEmail:
            options.emailVerification?.sendVerificationEmail ??
            resolvedEmail.sender.sendVerificationEmail,
        }
      : options.emailVerification,
  });
}

export type AppAuth = ReturnType<typeof createAppAuth>;
export type AppAuthSession = AppAuth["$Infer"]["Session"];
export type AppAuthUser = AppAuthSession["user"];
