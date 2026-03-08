import { Text } from "@react-email/components";
import { AuthEmailLayout } from "./auth-email-layout";

export interface VerifyEmailProps {
  appName: string;
  userName?: string;
  verificationUrl: string;
}

export function VerifyEmail({
  appName,
  userName,
  verificationUrl,
}: VerifyEmailProps) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";

  return (
    <AuthEmailLayout
      actionLabel="Verify email"
      actionUrl={verificationUrl}
      appName={appName}
      footerText="If you did not create an account, you can safely ignore this message."
      heading={`Confirm your email for ${appName}`}
      intro={`${greeting} use the button below to verify your email address and finish setting up your account.`}
      preview={`Verify your email for ${appName}`}
    >
      <Text style={note}>
        Verifying your email helps keep your account secure and ensures you can
        recover access later.
      </Text>
    </AuthEmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  appName: "Tournament",
  userName: "Player One",
  verificationUrl: "https://example.com/verify-email?token=example-token",
} satisfies VerifyEmailProps;

const note = {
  color: "#526375",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};
