import type { ReactNode } from "react";

export interface AuthEmailUser {
  email?: string | null;
  name?: string | null;
}

export interface AuthActionEmailData {
  user: AuthEmailUser;
  url: string;
  token: string;
}

export interface AppEmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  react: ReactNode;
  text?: string;
}

export interface AppEmailSender {
  send(message: AppEmailMessage): Promise<void>;
}

export interface CreateAuthEmailServiceOptions {
  appName: string;
  from: string;
  sender: AppEmailSender;
}

export interface CreateResendEmailSenderOptions {
  apiKey: string;
}

export interface CreateResendAuthEmailServiceOptions {
  apiKey: string;
  appName: string;
  from: string;
}
