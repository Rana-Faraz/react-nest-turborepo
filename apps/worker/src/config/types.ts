export interface WorkerRedisConfig {
  host: string;
  port: number;
  db: number;
  password?: string;
}

export interface WorkerEmailConfig {
  resendApiKey?: string;
  from?: string;
  replyTo?: string;
}

export interface WorkerConfig {
  workerName: string;
  queueName: string;
  concurrency: number;
  redis: WorkerRedisConfig;
  redisQueuePrefix?: string;
  email: WorkerEmailConfig;
}
