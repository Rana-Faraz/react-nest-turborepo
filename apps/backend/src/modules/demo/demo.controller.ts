import {
  createDemoSubmissionBodySchema,
  createDemoSubmissionResponseSchema,
  listDemoSubmissionsQuerySchema,
  listDemoSubmissionsResponseSchema,
  type CreateDemoSubmissionBody,
  type CreateDemoSubmissionResponse,
  type ListDemoSubmissionsQuery,
  type ListDemoSubmissionsResponse,
} from "@repo/contracts";
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  SerializeOptions,
} from "@nestjs/common";
import { DemoService } from "./demo.service.js";

@Controller("demo/submissions")
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get()
  @SerializeOptions({ schema: listDemoSubmissionsResponseSchema })
  list(
    @Query({ schema: listDemoSubmissionsQuerySchema })
    query: ListDemoSubmissionsQuery,
  ): ListDemoSubmissionsResponse {
    return this.demoService.list(query);
  }

  @Post()
  @SerializeOptions({ schema: createDemoSubmissionResponseSchema })
  create(
    @Body({ schema: createDemoSubmissionBodySchema })
    body: CreateDemoSubmissionBody,
  ): CreateDemoSubmissionResponse {
    return this.demoService.create(body);
  }
}
