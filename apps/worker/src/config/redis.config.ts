import type { WorkerRedisConfig } from "./types";
import { parseInteger } from "./parsers";

export const DEFAULT_REDIS_HOST = "localhost";
export const DEFAULT_REDIS_PORT = 6379;
export const DEFAULT_REDIS_DB = 0;

export function loadRedisConfig(
  env: Record<string, string | undefined>,
): WorkerRedisConfig {
  const port = parseInteger(
    "REDIS_PORT",
    env["REDIS_PORT"],
    DEFAULT_REDIS_PORT,
  );
  const db = parseInteger("REDIS_DB", env["REDIS_DB"], DEFAULT_REDIS_DB);
  const password = env["REDIS_PASSWORD"] || undefined;

  if (port < 1) {
    throw new Error("REDIS_PORT must be greater than 0");
  }

  if (db < 0) {
    throw new Error("REDIS_DB must be 0 or greater");
  }

  return {
    host: env["REDIS_HOST"] || DEFAULT_REDIS_HOST,
    port,
    db,
    ...(password ? { password } : {}),
  };
}
