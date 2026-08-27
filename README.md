# react-nest-turborepo

Monorepo for a NestJS API, React web app, and Bun-based BullMQ worker.

## Workspace

### Apps

- `apps/backend`: NestJS API with TypeORM, Better Auth, native Standard Schema validation, and BullMQ producers
- `apps/web`: React 19 + Vite + TanStack Router + TanStack Query
- `apps/worker`: Bun runtime worker that consumes BullMQ jobs

### Packages

- `packages/contracts`: shared Zod schemas plus API and error contracts
- `packages/jobs`: shared queue definitions and job payload validation
- `packages/email`: React Email templates and preview tooling
- `packages/typescript-config`: shared TS config
- `packages/eslint-config`: shared ESLint flat config

## Requirements

- Node `>=24.15 <25` (the current Node 24 LTS line)
- `pnpm@11.24.0`
- Docker Desktop or Docker Engine for local PostgreSQL / Redis / QueueDash / MinIO
- Bun installed locally for direct worker runtime usage

## Install

```bash
pnpm install
```

## Local Environment

Environment variables are owned by the app that consumes them. On a fresh
clone, create the local files from the runnable examples:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
cp apps/worker/.env.example apps/worker/.env
```

The checked-in examples match the local Docker defaults. After copying the
backend example, replace `BETTER_AUTH_SECRET` with the output of
`openssl rand -hex 32`. Never reuse a local secret in a deployed environment.

Resend is optional for normal local startup. To deliver verification emails,
set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally
`RESEND_REPLY_TO_EMAIL` in `apps/worker/.env`. Without them, email jobs fail
with a clear configuration error while the rest of the stack remains usable.

Start the required database and queue infrastructure, then the app graph:

```bash
docker compose up -d postgres redis queuedash
pnpm dev
```

Backend migrations run automatically on startup. Local endpoints:

- Web: http://localhost:5173
- Backend: http://localhost:3000
- QueueDash: http://localhost:3100
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

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

## TypeScript Baseline

Shared compiler defaults live in:

- `packages/typescript-config/base.json`

Current shared defaults include:

- `module` / `moduleResolution`: `NodeNext`
- declaration output enabled
- `noUncheckedIndexedAccess: true`
- `strict: true` in the shared base

TypeScript 7 is the command-line compiler. TypeScript 6 is installed beside it
under the `typescript` package name so tools that still use the compiler API,
such as `typescript-eslint`, remain compatible.

## Linting Status

Every app and source package extends the flat config from
`packages/eslint-config`. Run all workspace linters with `pnpm lint`, or use a
workspace's scoped `lint` command while developing.

## Scoped Commands

### Backend

```bash
pnpm --filter backend dev
pnpm --filter backend build
pnpm --filter backend lint
pnpm --filter backend test
```

### Web

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web test
```

### Worker

```bash
pnpm --filter worker dev
pnpm --filter worker build
pnpm --filter worker check-types
pnpm --filter worker lint
pnpm --filter worker test
```

### Shared Packages

```bash
pnpm --filter @repo/contracts build
pnpm --filter @repo/jobs build
pnpm --filter @repo/emails build
pnpm --filter @repo/contracts lint
pnpm --filter @repo/jobs lint
pnpm --filter @repo/emails lint
pnpm --filter @repo/emails dev
```

## Local Infrastructure

This repo includes local Docker services for:

- PostgreSQL
- Redis
- QueueDash
- MinIO

Start them with:

```bash
docker compose up -d postgres redis queuedash minio
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
exported with constant-style names such as `BACKGROUND_TASKS_QUEUE`,
`LOG_MESSAGE_JOB`, and `SEND_VERIFICATION_EMAIL_JOB`, so backend producers and
worker consumers use the same contract boundary.

The worker supports `send.verification-email`, which renders the verification
template from `@repo/emails` and sends it through Resend when
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured.

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
