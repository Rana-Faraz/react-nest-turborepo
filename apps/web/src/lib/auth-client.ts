import { createAuthClient } from "better-auth/react";
import type { AppAuthSession, AppAuthUser } from "@repo/auth";
import { API_BASE_URL } from "@/lib/api";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = AuthSession["user"];

type SessionTypeCompatibility = AuthSession extends AppAuthSession
  ? AppAuthSession extends AuthSession
    ? true
    : never
  : never;

type UserTypeCompatibility = AuthUser extends AppAuthUser
  ? AppAuthUser extends AuthUser
    ? true
    : never
  : never;

const sessionTypeCompatibility: SessionTypeCompatibility = true;
const userTypeCompatibility: UserTypeCompatibility = true;

void sessionTypeCompatibility;
void userTypeCompatibility;
