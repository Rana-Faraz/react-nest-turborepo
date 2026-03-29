# react-nest-turborepo

Monorepo for a NestJS API, React web app, and Bun-based BullMQ worker.

## Workspace

### Apps

- `apps/backend`: NestJS API with TypeORM, Better Auth, `nestjs-zod`, and BullMQ producers
- `apps/web`: React 19 + Vite + TanStack Router + TanStack Query
- `apps/worker`: Bun runtime worker that consumes BullMQ jobs

### Packages

- `packages/contracts`: shared Zod schemas plus API and error contracts
- `packages/jobs`: shared queue definitions and job payload validation
- `packages/types`: shared TypeScript exports
- `packages/email`: React Email templates and preview tooling
- `packages/typescript-config`: shared TS config

## Requirements

- Node `>=22`
- `pnpm@9`
- Docker Desktop or Docker Engine for local Redis / QueueDash / MinIO
- Bun installed locally for direct worker runtime usage

## Install

```bash
pnpm install
```

## Template Init

Use the repo initializer when turning this template into a named project. It prompts for the project name, rewrites the root/workspace package names, updates internal dependency references, and can run `pnpm install`.

```bash
pnpm init:project
```

You can still bypass the prompt by passing the name directly:

```bash
pnpm init:project secured
```

Safe preview:

```bash
pnpm init:project secured --dry-run
```

## Common Commands

```bash
pnpm dev
pnpm build
pnpm check-types
pnpm format
```

## Scoped Commands

### Backend

```bash
pnpm --filter backend dev
pnpm --filter backend build
pnpm --filter backend test
```

### Web

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web test
```

### Worker

```bash
pnpm --filter worker dev
pnpm --filter worker build
pnpm --filter worker check-types
pnpm --filter worker test
```

### Shared Packages

```bash
pnpm --filter @repo/contracts build
pnpm --filter @repo/jobs build
pnpm --filter @repo/types build
pnpm --filter transactional dev
```

## Local Infrastructure

This repo includes local Docker services for:

- Redis
- QueueDash
- MinIO

Start them with:

```bash
docker compose up -d redis queuedash minio
```

Useful local URLs:

- QueueDash: http://localhost:3100
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9090
- Redis: `localhost:6379`

## Background Jobs

Background jobs use BullMQ.

Current flow:

1. `apps/backend` enqueues jobs using Nest BullMQ integration
2. `apps/worker` consumes those jobs with a Bun worker process
3. QueueDash shows queue and job state

Shared queue names and job definitions live in:

- `packages/jobs/src/background-tasks.ts`

Each shared job is defined as an object with a `name` and `validate` schema,
exported with constant-style names such as `BACKGROUND_TASKS_QUEUE` and
`LOG_MESSAGE_JOB`, so backend producers and worker consumers use the same
contract boundary.

Full background-jobs documentation lives in:

- `docs/background-jobs.md`

## Quick Smoke Test

Start Redis and QueueDash:

```bash
docker compose up -d redis queuedash
```

Start backend and worker in separate terminals:

```bash
pnpm --filter backend dev
pnpm --filter worker dev
```

Enqueue the demo log job:

```powershell
curl.exe -X POST "http://localhost:3000/demo/jobs/log" `
  -H "Content-Type: application/json" `
  -d '{"message":"hello from backend"}'
```

Expected result:

- backend returns a queued job response
- worker logs `hello from backend`
- QueueDash shows the job

## Repo Notes

- Use `pnpm`, not `npm` or `yarn`
- Treat `apps/web/src/routeTree.gen.ts` as generated
- Treat package `dist/` output as generated
- Prefer shared contracts in `packages/contracts` for HTTP contracts
- Prefer shared job definitions in `packages/jobs` for queue names and job payload validation

## Additional Docs

- `AGENTS.md`
- `docs/background-jobs.md`
- `apps/backend/README.md`
- `apps/worker/README.md`
