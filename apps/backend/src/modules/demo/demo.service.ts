import {
  createDemoSubmissionResponseSchema,
  listDemoSubmissionsResponseSchema,
  type CreateDemoSubmissionBody,
  type CreateDemoSubmissionResponse,
  type DemoSubmission,
  type ListDemoSubmissionsQuery,
  type ListDemoSubmissionsResponse,
} from "@repo/contracts";
import {
  type LogMessageJobData,
  queuedJobResponseSchema,
  type QueuedJobResponse,
} from "@repo/jobs";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { BackgroundJobsService } from "../background-jobs/background-jobs.service";

@Injectable()
export class DemoService {
  private readonly submissions: DemoSubmission[] = [
    {
      id: randomUUID(),
      name: "Seeded Player",
      score: 87,
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(
    private readonly backgroundJobsService: BackgroundJobsService,
  ) {}

  list(query: ListDemoSubmissionsQuery): ListDemoSubmissionsResponse {
    const search = query.search?.toLowerCase();
    const filtered = search
      ? this.submissions.filter((submission) =>
          submission.name.toLowerCase().includes(search),
        )
      : this.submissions;

    return listDemoSubmissionsResponseSchema.parse({
      items: filtered.slice(0, query.limit),
      total: filtered.length,
    });
  }

  create(body: CreateDemoSubmissionBody): CreateDemoSubmissionResponse {
    const item: DemoSubmission = {
      id: randomUUID(),
      name: body.name,
      score: body.score,
      createdAt: new Date().toISOString(),
    };

    this.submissions.unshift(item);

    return createDemoSubmissionResponseSchema.parse({ item });
  }

  async enqueueLogMessage(
    body: LogMessageJobData,
  ): Promise<QueuedJobResponse> {
    const response = await this.backgroundJobsService.enqueueLogMessage(
      body.message,
    );

    return queuedJobResponseSchema.parse(response);
  }
}
