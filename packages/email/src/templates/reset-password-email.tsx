import { Text } from "@react-email/components";
import { AuthEmailLayout } from "./auth-email-layout";

export interface ResetPasswordEmailProps {
  appName: string;
  resetUrl: string;
  userName?: string;
}

export function ResetPasswordEmail({
  appName,
  resetUrl,
  userName,
}: ResetPasswordEmailProps) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";

  return (
    <AuthEmailLayout
      actionLabel="Reset password"
      actionUrl={resetUrl}
      appName={appName}
      footerText="If you did not request this change, no action is required."
      heading={`Reset your ${appName} password`}
      intro={`${greeting} we received a request to reset your password. Use the button below to choose a new one.`}
      preview={`Reset your ${appName} password`}
    >
      <Text style={note}>
        For security, this link should only be used by you and may expire after
        a short time.
      </Text>
    </AuthEmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  appName: "Tournament",
  resetUrl: "https://example.com/reset-password/example-token",
  userName: "Player One",
} satisfies ResetPasswordEmailProps;

const note = {
  color: "#526375",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};
