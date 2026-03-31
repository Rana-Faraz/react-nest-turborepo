# Worker

Bun-native background worker for BullMQ jobs.

## Current Scope

- boots a long-running BullMQ consumer
- connects to Redis using the local `.env`
- logs job lifecycle events for the configured queue
- loads worker, Redis, and email settings from `src/config`
- keeps job handlers under `src/jobs`
- consumes shared queue and job definitions from `@repo/jobs`
- can send verification emails through Resend when email env vars are configured

## Tests

- `tests/unit`: worker unit tests
- `tests/helpers`: reusable testing utilities and fakes

## Scripts

```bash
pnpm --filter worker dev
pnpm --filter worker build
pnpm --filter worker check-types
pnpm --filter worker test
pnpm --filter worker test:coverage
```

## Job Layout

- `src/config`: worker, Redis, and email config loaders
- `src/worker.ts`: BullMQ worker setup and lifecycle logging
- `src/jobs`: job handlers and dispatch registration
- `tests/unit/jobs`: job-level tests

## Email Sending

The worker can process `send.verification-email` jobs from the shared
`background-tasks` queue.

Verification emails use the React Email template exported from `@repo/emails`.

Required environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Optional environment variable:

- `RESEND_REPLY_TO_EMAIL`

See:

- `docs/background-jobs.md`
