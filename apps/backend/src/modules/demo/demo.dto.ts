import {
  createDemoSubmissionBodySchema,
  createDemoSubmissionResponseSchema,
  listDemoSubmissionsQuerySchema,
  listDemoSubmissionsResponseSchema,
} from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ListDemoSubmissionsQueryDto extends createZodDto(
  listDemoSubmissionsQuerySchema,
) {}

export class ListDemoSubmissionsResponseDto extends createZodDto(
  listDemoSubmissionsResponseSchema,
) {}

export class CreateDemoSubmissionBodyDto extends createZodDto(
  createDemoSubmissionBodySchema,
) {}

export class CreateDemoSubmissionResponseDto extends createZodDto(
  createDemoSubmissionResponseSchema,
) {}
