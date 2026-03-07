import { z, type ZodIssue } from "zod";

export const apiErrorIssuePathSegmentSchema = z.union([
  z.string(),
  z.number(),
]);

export const apiErrorIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(apiErrorIssuePathSegmentSchema),
});

export const apiErrorDetailsSchema = z.object({
  code: z.string(),
  message: z.string(),
  formErrors: z.array(z.string()),
  fieldErrors: z.record(z.string(), z.array(z.string())),
  issues: z.array(apiErrorIssueSchema),
});

export const apiErrorResponseSchema = z.object({
  statusCode: z.number().int().nonnegative(),
  error: apiErrorDetailsSchema,
});

export type ApiErrorIssue = z.infer<typeof apiErrorIssueSchema>;
export type ApiErrorDetails = z.infer<typeof apiErrorDetailsSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

export function issuePathToFieldKey(path: ApiErrorIssue["path"]): string {
  return path.map(String).join(".");
}

function normalizeIssues(
  issues: ReadonlyArray<Pick<ZodIssue, "code" | "message" | "path">>,
): ApiErrorIssue[] {
  return issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.map((segment) =>
      typeof segment === "number" ? segment : String(segment),
    ),
  }));
}

export function buildValidationErrorDetails(
  issues: ReadonlyArray<Pick<ZodIssue, "code" | "message" | "path">>,
  options: {
    code?: string;
    message?: string;
  } = {},
): ApiErrorDetails {
  const normalizedIssues = normalizeIssues(issues);
  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];

  for (const issue of normalizedIssues) {
    if (issue.path.length === 0) {
      formErrors.push(issue.message);
      continue;
    }

    const key = issuePathToFieldKey(issue.path);
    fieldErrors[key] ??= [];
    fieldErrors[key].push(issue.message);
  }

  return apiErrorDetailsSchema.parse({
    code: options.code ?? "validation_error",
    message: options.message ?? "Validation failed",
    formErrors,
    fieldErrors,
    issues: normalizedIssues,
  });
}

export function createValidationErrorResponse(
  issues: ReadonlyArray<Pick<ZodIssue, "code" | "message" | "path">>,
  options: {
    statusCode?: number;
    code?: string;
    message?: string;
  } = {},
): ApiErrorResponse {
  return apiErrorResponseSchema.parse({
    statusCode: options.statusCode ?? 400,
    error: buildValidationErrorDetails(issues, options),
  });
}

export function createApiErrorResponse(input: ApiErrorResponse): ApiErrorResponse {
  return apiErrorResponseSchema.parse(input);
}
