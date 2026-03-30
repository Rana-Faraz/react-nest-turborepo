import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  app.enableCors({
    origin: process.env["FRONTEND_URL"] || true,
    credentials: true,
  });

  // Better Auth expects raw request handling on its own routes. Re-enable JSON
  // parsing explicitly for the rest of the application.
  app.use("/demo", json());
  app.use("/demo", urlencoded({ extended: true }));

  await app.listen(Number(process.env["PORT"]) || 3000);
}

void bootstrap();
