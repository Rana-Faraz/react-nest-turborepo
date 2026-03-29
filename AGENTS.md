# AGENTS.md

## Project Snapshot

- Monorepo managed with `pnpm` and Turborepo.
- Runtime split:
  - `apps/backend`: NestJS API with TypeORM, Better Auth, and `nestjs-zod`.
  - `apps/web`: React 19 + Vite + TanStack Router + TanStack Query.
  - `apps/worker`: Bun worker for BullMQ jobs.
  - `packages/contracts`: shared Zod schemas and API/error contracts.
  - `packages/jobs`: shared queue definitions and job payload validation.
  - `packages/types`: shared TS package for cross-project types/utilities.
- Node requirement: `>=22`.
- Package manager: `pnpm@9.0.0`.

## Working Norms

- Use `pnpm`, not `npm` or `yarn`.
- Prefer `rg` for search and `pnpm --filter <pkg>` for scoped commands.
- Keep changes targeted. Do not modify generated outputs unless the source change requires regeneration.
- Treat `apps/web/src/routeTree.gen.ts` as generated. Edit route source files instead.
- Treat `dist/` artifacts in packages as generated output from `tsup`.
- Prefer shared contracts in `packages/contracts` for request/response shapes and validation logic instead of redefining schemas in apps.
- If the root `README.md` conflicts with the codebase, trust `package.json`, `turbo.json`, and the app/package source. The README currently contains stale product/setup details.

## Common Commands

- Install deps: `pnpm install`
- Run full dev graph: `pnpm dev`
- Build all workspaces: `pnpm build`
- Check types across the repo: `pnpm check-types`
- Format repo files: `pnpm format`

## Scoped Commands

- Web dev: `pnpm --filter web dev`
- Web build: `pnpm --filter web build`
- Web lint: `pnpm --filter web lint`
- Web test: `pnpm --filter web test`

- Backend dev: `pnpm --filter backend dev`
- Backend build: `pnpm --filter backend build`
- Backend lint: `pnpm --filter backend lint`
- Backend test: `pnpm --filter backend test`

- Contracts build: `pnpm --filter @repo/contracts build`
- Contracts lint: `pnpm --filter @repo/contracts lint`
- Jobs build: `pnpm --filter @repo/jobs build`
- Jobs lint: `pnpm --filter @repo/jobs lint`

## Architecture Notes

### Backend

- Entry module: `apps/backend/src/app.module.ts`
- Config lives under `apps/backend/src/config`.
- TypeORM entities live under `apps/backend/src/entities`.
- Feature modules currently include `health` and `demo`.
- Better Auth is wired through `apps/backend/src/lib/auth.ts`.
- Zod validation errors are normalized through shared contract helpers.

### Web

- App entry: `apps/web/src/main.tsx`
- File-based routes live under `apps/web/src/routes`.
- Shared API/auth/query helpers live under `apps/web/src/lib` and `apps/web/src/queries`.
- Router generation is part of web build/dev via `tsr generate`.

### Shared Packages

- `packages/contracts/src`: canonical cross-app schemas and error helpers.
- `packages/jobs/src`: canonical queue definitions and job validation.
- `packages/types/src`: shared low-level TS exports.

## Change Guidance

- For API changes, update `packages/contracts` first, then wire backend handlers/controllers, then update frontend queries/components.
- For queue/job changes, update `packages/jobs` first, then wire backend producers and worker consumers.
- For new backend modules, follow the existing Nest module/controller/service split under `apps/backend/src/modules`.
- For new frontend data flows, keep fetch/query logic in `apps/web/src/queries` and keep route components thin.
- Preserve the current React/TanStack patterns instead of introducing a second routing or state-management approach.

## Validation Expectations

- Run the narrowest relevant checks after changes.
- Typical frontend change: `pnpm --filter web test` and `pnpm --filter web lint`.
- Typical backend change: `pnpm --filter backend test` and `pnpm --filter backend lint`.
- Cross-cutting contract or job change: `pnpm check-types` and any affected package/app build or tests.
