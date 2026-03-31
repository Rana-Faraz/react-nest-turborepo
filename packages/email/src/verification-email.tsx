import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";
import type { ReactElement } from "react";

export interface VerificationEmailProps {
  name?: string;
  productName?: string;
  verificationUrl: string;
  expiresInHours?: number;
  supportEmail?: string;
}

interface VerificationEmailComponent {
  (props: VerificationEmailProps): ReactElement;
  PreviewProps?: VerificationEmailProps;
}

export const VerificationEmail: VerificationEmailComponent = ({
  name,
  productName = "Tournament Hub",
  verificationUrl,
  expiresInHours = 24,
  supportEmail = "support@example.com",
}: VerificationEmailProps) => {
  const previewText = `Verify your email for ${productName}`;

  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#1d4ed8",
                ink: "#0f172a",
                muted: "#64748b",
                surface: "#f8fafc",
                line: "#dbeafe",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-[#eef4ff] py-[32px] font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto w-full max-w-[560px] rounded-[24px] bg-white px-[32px] py-[36px]">
            <Section className="mb-[24px]">
              <Text className="m-0 text-[12px] font-semibold uppercase tracking-[1px] text-brand">
                {productName}
              </Text>
              <Heading className="m-0 mt-[12px] text-[28px] leading-[34px] text-ink">
                Confirm your email address
              </Heading>
            </Section>

            <Section>
              <Text className="m-0 text-[16px] leading-[26px] text-ink">
                {name ? `Hi ${name},` : "Hi,"}
              </Text>
              <Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-ink">
                Finish setting up your account by verifying the email address you
                just used to sign up. This link expires in {expiresInHours} hours.
              </Text>
            </Section>

            <Section className="mt-[28px]">
              <Button
                href={verificationUrl}
                className="box-border rounded-[14px] bg-brand px-[20px] py-[14px] text-[15px] font-semibold text-white no-underline"
              >
                Verify email
              </Button>
            </Section>

            <Section className="mt-[24px] rounded-[16px] bg-surface px-[20px] py-[18px]">
              <Text className="m-0 text-[14px] leading-[22px] text-muted">
                If the button does not work, copy and paste this link into your
                browser:
              </Text>
              <Link
                href={verificationUrl}
                className="mt-[12px] block break-all text-[14px] leading-[22px] text-brand no-underline"
              >
                {verificationUrl}
              </Link>
            </Section>

            <Hr className="my-[28px] w-full border-none border-t border-solid border-line" />

            <Section>
              <Text className="m-0 text-[13px] leading-[22px] text-muted">
                If you did not create an account, you can safely ignore this
                email.
              </Text>
              <Text className="m-0 mt-[12px] text-[13px] leading-[22px] text-muted">
                Need help? Contact{" "}
                <Link
                  href={`mailto:${supportEmail}`}
                  className="text-brand no-underline"
                >
                  {supportEmail}
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerificationEmail.PreviewProps = {
  name: "Jordan",
  productName: "Tournament Hub",
  verificationUrl: "https://example.com/verify-email?token=abc123",
  expiresInHours: 24,
  supportEmail: "support@example.com",
} satisfies VerificationEmailProps;

export default VerificationEmail;
