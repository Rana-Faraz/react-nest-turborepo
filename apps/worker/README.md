# Worker

Bun-native background worker for BullMQ jobs.

## Current Scope

- boots a long-running BullMQ consumer
- connects to Redis using the local `.env`
- logs job lifecycle events for the configured queue
- keeps job handlers under `src/jobs`
- consumes shared queue and job definitions from `@repo/jobs`

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

- `src/worker.ts`: BullMQ worker setup and lifecycle logging
- `src/jobs`: job handlers and dispatch registration
- `tests/unit/jobs`: job-level tests

See:

- `docs/background-jobs.md`
