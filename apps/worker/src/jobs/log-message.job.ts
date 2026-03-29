import { LOG_MESSAGE_JOB } from "@repo/jobs";
import type { WorkerLogger } from "../worker";
import type { WorkerJob, WorkerJobDefinition } from "./types";

export function createLogMessageJobDefinition(
  logger: WorkerLogger,
): WorkerJobDefinition {
  return {
    name: LOG_MESSAGE_JOB.name,
    handle: async (job: WorkerJob) => {
      const data = LOG_MESSAGE_JOB.validate.parse(job.data);
      logger.info(data.message);
    },
  };
}
