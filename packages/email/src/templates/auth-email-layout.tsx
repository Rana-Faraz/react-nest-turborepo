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
  Text,
} from "@react-email/components";
import type { PropsWithChildren } from "react";

export interface AuthEmailLayoutProps extends PropsWithChildren {
  actionLabel: string;
  actionUrl: string;
  appName: string;
  footerText: string;
  heading: string;
  intro: string;
  preview: string;
}

export function AuthEmailLayout({
  actionLabel,
  actionUrl,
  appName,
  children,
  footerText,
  heading,
  intro,
  preview,
}: AuthEmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={main}>
        <Preview>{preview}</Preview>
        <Container style={container}>
          <Section style={card}>
            <Text style={eyebrow}>{appName}</Text>
            <Heading style={headingStyle}>{heading}</Heading>
            <Text style={paragraph}>{intro}</Text>
            {children}
            <Section style={buttonRow}>
              <Button href={actionUrl} style={button}>
                {actionLabel}
              </Button>
            </Section>
            <Text style={mutedParagraph}>
              If the button does not work, copy and paste this link into your
              browser:
            </Text>
            <Link href={actionUrl} style={link}>
              {actionUrl}
            </Link>
            <Hr style={divider} />
            <Text style={footer}>{footerText}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f3f6fb",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: "32px 12px",
};

const container = {
  margin: "0 auto",
  maxWidth: "560px",
};

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #d8e0ec",
  borderRadius: "20px",
  padding: "32px",
};

const eyebrow = {
  color: "#4d647c",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.12em",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
};

const headingStyle = {
  color: "#102033",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const mutedParagraph = {
  color: "#526375",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const buttonRow = {
  margin: "28px 0",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "12px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 22px",
  textDecoration: "none",
};

const link = {
  color: "#0f172a",
  fontSize: "14px",
  lineHeight: "1.7",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const divider = {
  borderColor: "#d8e0ec",
  margin: "28px 0 20px",
};

const footer = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: 0,
};
