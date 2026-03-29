# Backend

NestJS API for the repo.

## Current Scope

- `GET /health`
- global validation pipe
- permissive CORS bootstrap for local development
- BullMQ producer wiring for background jobs

## Scripts

```bash
pnpm --filter backend dev
pnpm --filter backend build
pnpm --filter backend test
```

## Background Jobs

- shared queue setup is registered in `src/app.module.ts`
- producers live in `src/modules/background-jobs`
- the demo enqueue endpoint lives in `src/modules/demo/demo-jobs.controller.ts`
- shared queue/job definitions live in `@repo/jobs`

See:

- `docs/background-jobs.md`
