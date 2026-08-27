import {
  LOG_MESSAGE_JOB,
  queuedJobResponseSchema,
  type LogMessageJobData,
  type QueuedJobResponse,
} from "@repo/jobs";
import { Body, Controller, Post, SerializeOptions } from "@nestjs/common";
import { DemoService } from "./demo.service.js";

@Controller("demo/jobs")
export class DemoJobsController {
  constructor(private readonly demoService: DemoService) {}

  @Post("log")
  @SerializeOptions({ schema: queuedJobResponseSchema })
  enqueueLogMessage(
    @Body({ schema: LOG_MESSAGE_JOB.validate }) body: LogMessageJobData,
  ): Promise<QueuedJobResponse> {
    return this.demoService.enqueueLogMessage(body);
  }
}
