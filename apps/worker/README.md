# Worker

Minimal NestJS worker app for background jobs.

## Current Scope

- `GET /health`
- bootstraps a long-running worker process
- BullMQ wired to Redis with a registered queue and stub processor

## Scripts

```bash
pnpm --filter worker dev
pnpm --filter worker build
pnpm --filter worker test
```
