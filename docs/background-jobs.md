# Background Jobs

This repo uses BullMQ for background work.

## Current Architecture

The flow is:

1. Backend enqueues a job into Redis.
2. The Bun worker consumes the job from BullMQ.
3. QueueDash shows queue state in the browser.

The shared queue and job definitions live in:

- `packages/jobs/src/background-tasks.ts`

`@repo/jobs` is a compiled workspace package. It uses `tsup` to emit the
runtime JS and declaration files consumed by backend and worker.

The current producer path lives in:

- `apps/backend/src/modules/background-jobs`
- `apps/backend/src/modules/demo/demo-jobs.controller.ts`

The current consumer path lives in:

- `apps/worker/src/jobs`
- `apps/worker/src/worker.ts`

## Queue Contract

Right now there is one queue:

- `background-tasks`

Right now there are two jobs:

- `log.message`
- `send.verification-email`

`send.verification-email` is a dedicated verification-email path. The shared
payload supports:

- `email`
- `name`: optional recipient name
- `productName`: optional product label for subject/body copy
- `verificationUrl`
- `expiresInHours`
- `supportEmail`
- `idempotencyKey`: optional explicit Resend idempotency key

The worker sends that job through Resend using the React Email template in
`packages/email/src/verification-email.tsx`.
If `idempotencyKey` is omitted, the worker derives one from the BullMQ job id
so retries do not create duplicate sends within Resend's idempotency window.

Shared queue definitions belong in `packages/jobs/src`.

Each job should be defined as an object with:

- `name`: the BullMQ job name
- `validate`: the Zod schema used by producers and consumers

Prefer constant-style shared exports such as `BACKGROUND_TASKS_QUEUE` and
`LOG_MESSAGE_JOB`.

Shared enqueue response schemas for job APIs also live in `@repo/jobs` when
they are part of the queue boundary.

Do not redefine queue payload shapes inside the backend or worker.

## Backend Pattern

The Nest backend uses the Nest BullMQ integration:

- `BullModule.forRootAsync(...)` in `apps/backend/src/app.module.ts`
- `BullModule.registerQueue(...)` in `apps/backend/src/modules/background-jobs/background-jobs.module.ts`
- `@InjectQueue(...)` in `apps/backend/src/modules/background-jobs/background-jobs.service.ts`

If you add a new producer:

1. Add the shared queue/job definition in `packages/jobs/src`
2. Add a producer method in `BackgroundJobsService`
3. Expose it through the appropriate controller/service path

## Worker Pattern

The worker is Bun-native, but BullMQ-native in behavior.

Job logic belongs in:

- `apps/worker/src/jobs`

Use this layout:

- one file per job definition/handler
- keep queue wiring and BullMQ lifecycle logging in `apps/worker/src/worker.ts`
- keep job-specific validation and behavior inside the jobs directory

If you add a new job:

1. Add the job definition in `packages/jobs/src`
2. Add a new job file in `apps/worker/src/jobs`
3. Register it in `apps/worker/src/jobs/index.ts`
4. Add a unit test under `apps/worker/tests/unit/jobs`

## Email Configuration

Verification email delivery uses Resend from within the worker process.

Worker configuration is split by concern under:

- `apps/worker/src/config/worker.config.ts`
- `apps/worker/src/config/redis.config.ts`
- `apps/worker/src/config/email.config.ts`

Required worker environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Optional worker environment variable:

- `RESEND_REPLY_TO_EMAIL`

The verification-email job treats request validation, authentication, and
authorization failures as non-retryable and discards those BullMQ jobs before
surfacing the failure. Rate-limit and API failures remain retryable.

## Local Development

Start infrastructure:

```bash
docker compose up -d redis queuedash
```

Start the worker:

```bash
pnpm --filter worker dev
```

Start the backend:

```bash
pnpm --filter backend dev
```

Open QueueDash:

- http://localhost:3100

## Quick Test

Enqueue the demo log job:

```powershell
curl.exe -X POST "http://localhost:3000/demo/jobs/log" `
  -H "Content-Type: application/json" `
  -d '{"message":"hello from backend"}'
```

Expected behavior:

- backend returns `{ jobId, queueName, status }`
- worker logs `hello from backend`
- QueueDash shows the job in the UI

## Validation

Useful commands:

```bash
pnpm --filter @repo/contracts build
pnpm --filter @repo/jobs build
pnpm --filter backend build
pnpm --filter backend test
pnpm --filter worker check-types
pnpm --filter worker test
pnpm --filter worker build
```

## Notes

- QueueDash is configured in `docker-compose.yml`
- Redis password defaults to `redis123` in local compose
- If you change queue names or Redis settings, keep backend, worker, and QueueDash aligned
