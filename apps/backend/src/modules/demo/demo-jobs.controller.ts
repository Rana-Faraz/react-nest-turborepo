import { type QueuedJobResponse } from "@repo/jobs";
import { Body, Controller, Post } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { DemoService } from "./demo.service";
import {
  EnqueueLogMessageBodyDto,
  EnqueueLogMessageResponseDto,
} from "./demo.dto";

@Controller("demo/jobs")
export class DemoJobsController {
  constructor(private readonly demoService: DemoService) {}

  @Post("log")
  @ZodSerializerDto(EnqueueLogMessageResponseDto)
  enqueueLogMessage(
    @Body() body: EnqueueLogMessageBodyDto,
  ): Promise<QueuedJobResponse> {
    return this.demoService.enqueueLogMessage(body);
  }
}
