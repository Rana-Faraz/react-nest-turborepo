import { ResetPasswordEmail } from "./templates/reset-password-email";
import { VerifyEmail } from "./templates/verify-email";
import { createResendEmailSender } from "./resend";
import type {
  AuthActionEmailData,
  CreateAuthEmailServiceOptions,
  CreateResendAuthEmailServiceOptions,
} from "./types";

function getRecipientName(name?: string | null) {
  const trimmedName = name?.trim();

  return trimmedName && trimmedName.length > 0 ? trimmedName : undefined;
}

function getRecipientEmail(email?: string | null) {
  const trimmedEmail = email?.trim();

  if (!trimmedEmail) {
    throw new Error("Auth email recipient is missing an email address.");
  }

  return trimmedEmail;
}

export function createAuthEmailService({
  appName,
  from,
  sender,
}: CreateAuthEmailServiceOptions) {
  return {
    async sendVerificationEmail(
      { user, url }: AuthActionEmailData,
      _request?: Request,
    ) {
      const recipientEmail = getRecipientEmail(user.email);

      await sender.send({
        from,
        to: recipientEmail,
        subject: `Verify your email for ${appName}`,
        react: (
          <VerifyEmail
            appName={appName}
            userName={getRecipientName(user.name)}
            verificationUrl={url}
          />
        ),
        text: [
          `Verify your email for ${appName}`,
          "",
          `Open this link to verify your email address: ${url}`,
          "",
          "If you did not create an account, you can ignore this email.",
        ].join("\n"),
      });
    },
    async sendResetPassword(
      { user, url }: AuthActionEmailData,
      _request?: Request,
    ) {
      const recipientEmail = getRecipientEmail(user.email);

      await sender.send({
        from,
        to: recipientEmail,
        subject: `Reset your ${appName} password`,
        react: (
          <ResetPasswordEmail
            appName={appName}
            resetUrl={url}
            userName={getRecipientName(user.name)}
          />
        ),
        text: [
          `Reset your ${appName} password`,
          "",
          `Open this link to choose a new password: ${url}`,
          "",
          "If you did not request a password reset, you can ignore this email.",
        ].join("\n"),
      });
    },
  };
}

export function createResendAuthEmailService({
  apiKey,
  appName,
  from,
}: CreateResendAuthEmailServiceOptions) {
  return createAuthEmailService({
    appName,
    from,
    sender: createResendEmailSender({ apiKey }),
  });
}
