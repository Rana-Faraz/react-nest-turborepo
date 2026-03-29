import {
  createDemoSubmissionBodySchema,
  createDemoSubmissionResponseSchema,
  listDemoSubmissionsQuerySchema,
  listDemoSubmissionsResponseSchema,
} from "@repo/contracts";
import { LOG_MESSAGE_JOB, queuedJobResponseSchema } from "@repo/jobs";
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

export class EnqueueLogMessageBodyDto extends createZodDto(
  LOG_MESSAGE_JOB.validate,
) {}

export class EnqueueLogMessageResponseDto extends createZodDto(
  queuedJobResponseSchema,
) {}
