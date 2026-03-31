import type { WorkerConfig } from "../config";
import { createResendClientProvider } from "../email/resend-email-sender";
import type { WorkerLogger } from "../worker";
import { createLogMessageJobDefinition } from "./log-message.job";
import { createSendVerificationEmailJobDefinition } from "./send-verification-email.job";
import type { WorkerJob, WorkerJobDefinition, WorkerJobHandler } from "./types";

function createJobDefinitions(
  config: WorkerConfig,
  logger: WorkerLogger,
): WorkerJobDefinition[] {
  const getResendClient = createResendClientProvider(config);

  return [
    createLogMessageJobDefinition(logger),
    createSendVerificationEmailJobDefinition(config, logger, getResendClient),
  ];
}

export function createWorkerJobHandler(
  config: WorkerConfig,
  logger: WorkerLogger,
): WorkerJobHandler {
  const jobsByName = new Map(
    createJobDefinitions(config, logger).map((jobDefinition) => [
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
