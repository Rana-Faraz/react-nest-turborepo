import {
  createDemoSubmissionBodySchema,
  createDemoSubmissionResponseSchema,
  listDemoSubmissionsQuerySchema,
  listDemoSubmissionsResponseSchema,
  type CreateDemoSubmissionBody,
  type CreateDemoSubmissionResponse,
  type ListDemoSubmissionsQuery,
} from "@repo/contracts";
import { queryOptions } from "@tanstack/react-query";
import { apiRequest, asApiError } from "@/lib/api";

export const demoQueryKeys = {
  all: ["demo", "submissions"] as const,
  list: (query: ListDemoSubmissionsQuery) =>
    [...demoQueryKeys.all, query] as const,
};

export function demoSubmissionsQueryOptions(
  query: Partial<ListDemoSubmissionsQuery> = {}
) {
  const parsedQuery = listDemoSubmissionsQuerySchema.parse(query);

  return queryOptions({
    queryKey: demoQueryKeys.list(parsedQuery),
    queryFn: async ({ signal }) => {
      const response = await apiRequest({
        method: "GET",
        path: "/demo/submissions",
        params: parsedQuery,
        signal,
      });

      return listDemoSubmissionsResponseSchema.parse(response);
    },
  });
}

export async function createDemoSubmission(
  input: CreateDemoSubmissionBody
): Promise<CreateDemoSubmissionResponse> {
  const parsedBody = createDemoSubmissionBodySchema.safeParse(input);

  if (!parsedBody.success) {
    throw asApiError(parsedBody.error);
  }

  const response = await apiRequest<
    CreateDemoSubmissionResponse,
    CreateDemoSubmissionBody
  >({
    method: "POST",
    path: "/demo/submissions",
    body: parsedBody.data,
  });

  const parsedResponse = createDemoSubmissionResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw asApiError(parsedResponse.error);
  }

  return parsedResponse.data;
}
