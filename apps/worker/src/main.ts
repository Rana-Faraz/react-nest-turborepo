import { loadWorkerConfig } from "./config";
import { createBackgroundWorker, defaultWorkerLogger } from "./worker";

async function bootstrap() {
  const config = loadWorkerConfig(process.env);
  const worker = createBackgroundWorker(config, defaultWorkerLogger);

  await worker.waitUntilReady();

  defaultWorkerLogger.info(
    `${config.workerName} initialized and subscribed to BullMQ queue "${config.queueName}"`,
  );
  defaultWorkerLogger.debug(
    `BullMQ worker ready with concurrency ${config.concurrency}`,
  );

  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    defaultWorkerLogger.info(
      `${config.workerName} received ${signal}; closing BullMQ worker`,
    );

    await worker.close();
    defaultWorkerLogger.info(`${config.workerName} shutdown complete`);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  defaultWorkerLogger.error(`Worker failed to start: ${message}`, error);
  process.exit(1);
});
