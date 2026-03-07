import { authClient, type AuthSession, type AuthUser } from "@/lib/auth-client";

export type UseAuthSessionResult = ReturnType<typeof authClient.useSession>;
export type SignInEmailInput = Parameters<typeof authClient.signIn.email>[0];
export type SignUpEmailInput = Parameters<typeof authClient.signUp.email>[0];
export type SignOutInput = Parameters<typeof authClient.signOut>[0];

export const auth = {
  client: authClient,
  useSession(): UseAuthSessionResult {
    return authClient.useSession();
  },
  signInEmail(input: SignInEmailInput) {
    return authClient.signIn.email(input);
  },
  signUpEmail(input: SignUpEmailInput) {
    return authClient.signUp.email(input);
  },
  signOut(input?: SignOutInput) {
    return authClient.signOut(input);
  },
};

export type { AuthSession, AuthUser };
