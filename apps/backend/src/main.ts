import { NestFactory } from "@nestjs/core";
import { toNodeHandler } from "better-auth/node";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module.js";
import { BetterAuthService } from "./modules/auth/better-auth.service.js";

async function bootstrap() {
  const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  const auth = app.get(BetterAuthService).auth;

  // Express 5 named wildcards are required. Register Better Auth before body
  // parsing so its Node handler receives the untouched request stream.
  expressApp.all("/api/auth/*splat", toNodeHandler(auth));

  // Restore parsing for every Nest route, including modules added later.
  app.use(json());
  app.use(urlencoded({ extended: true }));

  await app.listen(Number(process.env["PORT"]) || 3000);
}

void bootstrap();
