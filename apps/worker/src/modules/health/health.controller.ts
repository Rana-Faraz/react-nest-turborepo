import { Controller, Get } from "@nestjs/common";
import { WORKER_QUEUE_NAME } from "../../config/queue.config";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      queue: process.env.WORKER_QUEUE_NAME || WORKER_QUEUE_NAME,
      service: process.env.WORKER_NAME || "tournament-worker",
      status: "ok",
    };
  }
}
