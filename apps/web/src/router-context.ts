import type { QueryClient } from "@tanstack/react-query";
import type { AuthSession } from "@/lib/auth-client";

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthSession | null;
}
