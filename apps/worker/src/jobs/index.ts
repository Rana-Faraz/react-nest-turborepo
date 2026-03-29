import type { WorkerLogger } from "../worker";
import { createLogMessageJobDefinition } from "./log-message.job";
import type { WorkerJob, WorkerJobDefinition, WorkerJobHandler } from "./types";

function createJobDefinitions(logger: WorkerLogger): WorkerJobDefinition[] {
  return [createLogMessageJobDefinition(logger)];
}

export function createWorkerJobHandler(
  logger: WorkerLogger,
): WorkerJobHandler {
  const jobsByName = new Map(
    createJobDefinitions(logger).map((jobDefinition) => [
      jobDefinition.name,
      jobDefinition.handle,
    ]),
  );

  return async (job: WorkerJob) => {
    const handler = jobsByName.get(job.name);

    if (!handler) {
      logger.info(`Received job ${job.id} (${job.name})`);
      return;
    }

    await handler(job);
  };
}
