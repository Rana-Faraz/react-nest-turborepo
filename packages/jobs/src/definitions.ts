import type { z } from "zod";

export type JobSchema = z.ZodTypeAny;

export interface JobDefinition<
  TValidate extends JobSchema = JobSchema,
  TName extends string = string,
> {
  name: TName;
  validate: TValidate;
}

export interface QueueDefinition<
  TJobs extends Record<string, JobDefinition> = Record<string, JobDefinition>,
  TName extends string = string,
> {
  name: TName;
  jobs: TJobs;
}

export function defineJob<const TName extends string, TValidate extends JobSchema>(
  job: JobDefinition<TValidate, TName>,
): JobDefinition<TValidate, TName> {
  return job;
}

export function defineQueue<
  const TName extends string,
  const TJobs extends Record<string, JobDefinition>,
>(
  queue: QueueDefinition<TJobs, TName>,
): QueueDefinition<TJobs, TName> {
  return queue;
}

export type InferJobData<TJob extends JobDefinition> = z.infer<TJob["validate"]>;
