import {
  BACKGROUND_TASKS_QUEUE,
  LOG_MESSAGE_JOB,
  SEND_VERIFICATION_EMAIL_JOB,
  type LogMessageJobData,
  type SendVerificationEmailJobData,
  queuedJobResponseSchema,
  type QueuedJobResponse,
} from "@repo/jobs";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class BackgroundJobsService {
  constructor(
    @InjectQueue(BACKGROUND_TASKS_QUEUE.name)
    private readonly backgroundJobsQueue: Queue<
      LogMessageJobData | SendVerificationEmailJobData
    >,
  ) {}

  async enqueueLogMessage(message: string): Promise<QueuedJobResponse> {
    const data = LOG_MESSAGE_JOB.validate.parse({ message });
    const job = await this.backgroundJobsQueue.add(LOG_MESSAGE_JOB.name, data, {
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    return queuedJobResponseSchema.parse({
      jobId: String(job.id),
      queueName: BACKGROUND_TASKS_QUEUE.name,
      status: "queued",
    });
  }

  async enqueueVerificationEmail(
    payload: SendVerificationEmailJobData,
  ): Promise<QueuedJobResponse> {
    const data = SEND_VERIFICATION_EMAIL_JOB.validate.parse(payload);
    const job = await this.backgroundJobsQueue.add(
      SEND_VERIFICATION_EMAIL_JOB.name,
      data,
      {
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );

    return queuedJobResponseSchema.parse({
      jobId: String(job.id),
      queueName: BACKGROUND_TASKS_QUEUE.name,
      status: "queued",
    });
  }
}
