import { betterAuth, type BetterAuthOptions } from "better-auth";

export function createAppAuth({ ...options }: BetterAuthOptions) {
  return betterAuth({
    ...options,
  });
}

export type AppAuth = ReturnType<typeof createAppAuth>;
export type AppAuthSession = AppAuth["$Infer"]["Session"];
export type AppAuthUser = AppAuthSession["user"];
