import type { Job } from "bullmq";

export type WorkerJob = Job<unknown, unknown, string>;

export type WorkerJobHandler = (job: WorkerJob) => Promise<void>;

export interface WorkerJobDefinition {
  name: string;
  handle: WorkerJobHandler;
}
