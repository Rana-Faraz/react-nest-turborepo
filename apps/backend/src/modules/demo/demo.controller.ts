import {
  type CreateDemoSubmissionResponse,
  type ListDemoSubmissionsResponse,
} from "@repo/contracts";
import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { DemoService } from "./demo.service";
import {
  CreateDemoSubmissionBodyDto,
  CreateDemoSubmissionResponseDto,
  ListDemoSubmissionsQueryDto,
  ListDemoSubmissionsResponseDto,
} from "./demo.dto";

@Controller("demo/submissions")
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get()
  @ZodSerializerDto(ListDemoSubmissionsResponseDto)
  list(@Query() query: ListDemoSubmissionsQueryDto): ListDemoSubmissionsResponse {
    return this.demoService.list(query);
  }

  @Post()
  @ZodSerializerDto(CreateDemoSubmissionResponseDto)
  create(
    @Body() body: CreateDemoSubmissionBodyDto,
  ): CreateDemoSubmissionResponse {
    return this.demoService.create(body);
  }
}
