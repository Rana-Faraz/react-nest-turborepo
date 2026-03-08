import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3010;
  const workerName = process.env.WORKER_NAME || "tournament-worker";

  app.enableShutdownHooks();
  await app.listen(port);

  Logger.log(
    `${workerName} listening on http://localhost:${port}`,
    "Bootstrap",
  );
}

void bootstrap();
