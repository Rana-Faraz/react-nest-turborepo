import type { WorkerLogger } from "../../src/worker";

interface LoggerSpyCalls {
  info: string[];
  debug: string[];
  error: Array<{ message: string; error?: unknown }>;
}

export function createLoggerSpy(): {
  calls: LoggerSpyCalls;
  logger: WorkerLogger;
} {
  const calls: LoggerSpyCalls = {
    info: [],
    debug: [],
    error: [],
  };

  const logger: WorkerLogger = {
    info: (message) => {
      calls.info.push(message);
    },
    debug: (message) => {
      calls.debug.push(message);
    },
    error: (message, error) => {
      calls.error.push({ message, error });
    },
  };

  return { calls, logger };
}
