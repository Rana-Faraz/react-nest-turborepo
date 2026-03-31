import type { SignInEmailBody, SignUpEmailBody } from "@repo/contracts";
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const authQueryKeys = {
  all: ["auth"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
};

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        return null;
      }

      return data;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

export async function signInWithEmail(input: SignInEmailBody) {
  const { data, error } = await authClient.signIn.email({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(error.message ?? "Sign in failed");
  }

  return data;
}

export async function signUpWithEmail(
  input: Omit<SignUpEmailBody, "confirmPassword">
) {
  const { data, error } = await authClient.signUp.email({
    email: input.email,
    password: input.password,
    name: input.name,
  });

  if (error) {
    throw new Error(error.message ?? "Sign up failed");
  }

  return data;
}

export async function signOut() {
  const { error } = await authClient.signOut();

  if (error) {
    throw new Error(error.message ?? "Sign out failed");
  }

  return true;
}
