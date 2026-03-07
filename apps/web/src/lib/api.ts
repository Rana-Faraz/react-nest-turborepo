import {
  apiErrorResponseSchema,
  createValidationErrorResponse,
  type ApiErrorResponse,
} from "@repo/contracts";
import axios, {
  AxiosError,
  AxiosHeaders,
  type Method,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { ZodError } from "zod";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fieldErrors: ApiErrorResponse["error"]["fieldErrors"];
  readonly formErrors: ApiErrorResponse["error"]["formErrors"];
  readonly issues: ApiErrorResponse["error"]["issues"];

  constructor(response: ApiErrorResponse) {
    super(response.error.message);
    this.name = "ApiError";
    this.statusCode = response.statusCode;
    this.code = response.error.code;
    this.fieldErrors = response.error.fieldErrors;
    this.formErrors = response.error.formErrors;
    this.issues = response.error.issues;
  }
}

export type ApiRequestOptions<TBody = unknown> = Omit<
  AxiosRequestConfig<TBody>,
  "baseURL" | "url" | "method" | "data"
> & {
  body?: TBody;
  method: Method;
  path: string;
};

function createUnknownApiError(message: string, statusCode = 500): ApiError {
  return new ApiError({
    statusCode,
    error: {
      code: "unknown_error",
      message,
      formErrors: [],
      fieldErrors: {},
      issues: [],
    },
  });
}

function parseApiErrorPayload(
  payload: unknown,
  fallback: { statusCode: number; message: string },
): ApiError {
  const parsed = apiErrorResponseSchema.safeParse(payload);

  if (parsed.success) {
    return new ApiError(parsed.data);
  }

  return new ApiError({
    statusCode: fallback.statusCode,
    error: {
      code: "http_error",
      message: fallback.message,
      formErrors: [],
      fieldErrors: {},
      issues: [],
    },
  });
}

function normalizeAxiosError(error: AxiosError): ApiError {
  if (error.code === AxiosError.ERR_CANCELED) {
    return new ApiError({
      statusCode: 499,
      error: {
        code: "request_aborted",
        message: "Request was aborted",
        formErrors: [],
        fieldErrors: {},
        issues: [],
      },
    });
  }

  if (error.response) {
    return parseApiErrorPayload(error.response.data, {
      statusCode: error.response.status,
      message: error.message || `Request failed with status ${error.response.status}`,
    });
  }

  if (error.code === AxiosError.ETIMEDOUT || error.code === "ECONNABORTED") {
    return createUnknownApiError("Request timed out", 408);
  }

  return createUnknownApiError(error.message || "Network request failed");
}

export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiError(createValidationErrorResponse(error.issues));
  }

  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error);
  }

  return createUnknownApiError(
    error instanceof Error ? error.message : "Unknown request error",
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
  transitional: {
    clarifyTimeoutError: true,
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = AxiosHeaders.from(config.headers);

    if (!config.headers.has("Accept")) {
      config.headers.set("Accept", "application/json");
    }

    if (config.data !== undefined && !config.headers.has("Content-Type")) {
      config.headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error) => Promise.reject(asApiError(error)),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(asApiError(error)),
);

export async function apiRequest<TResponse, TBody = unknown>({
  body,
  method,
  path,
  ...config
}: ApiRequestOptions<TBody>,
): Promise<TResponse> {
  const response = await apiClient.request<TResponse, { data: TResponse }, TBody>(
    {
      ...config,
      method,
      url: path,
      data: body,
    },
  );
  return response.data;
}
