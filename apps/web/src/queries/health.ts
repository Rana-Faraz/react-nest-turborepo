import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface HealthResponse {
  service: string;
  status: string;
}

export function healthQueryOptions() {
  return queryOptions({
    queryKey: ["health"] as const,
    queryFn: ({ signal }) =>
      apiRequest<HealthResponse>({
        method: "GET",
        path: "/health",
        signal,
      }),
  });
}
