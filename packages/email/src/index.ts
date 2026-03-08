export {
  createAuthEmailService,
  createResendAuthEmailService,
} from "./service";
export { createResendEmailSender } from "./resend";
export { AuthEmailLayout } from "./templates/auth-email-layout";
export { ResetPasswordEmail } from "./templates/reset-password-email";
export { VerifyEmail } from "./templates/verify-email";
export type {
  AppEmailMessage,
  AppEmailSender,
  AuthActionEmailData,
  AuthEmailUser,
  CreateAuthEmailServiceOptions,
  CreateResendAuthEmailServiceOptions,
  CreateResendEmailSenderOptions,
} from "./types";
