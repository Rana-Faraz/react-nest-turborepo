# Architecture, dependency, and end-to-end contract research

Date: 2026-08-27
Scope: read-only research pass over the complete pnpm workspace. No dependency, lockfile, application, or configuration update was performed.

## Executive conclusion

The repository has a sound starting shape: one pnpm/Turborepo workspace, shared runtime Zod schemas for HTTP, and a shared Zod-validated queue package. The dependency graph, however, has enough version and configuration drift that upgrading everything in one change would be unnecessarily risky.

The safest direction is:

1. Repair package-manager reproducibility and pin the runtimes.
2. Clear directly actionable security updates within the current major lines.
3. Move coordinated framework families one major at a time.
4. Keep `packages/contracts` as the near-term source of truth and make both the server and every client consume route-level contracts with runtime response parsing.
5. Keep the internal endpoint helper deliberately small, then reconsider a mature contract library. oRPC v2 is a strong fit but its contract-first/Nest path is currently beta and newly released; ts-rest also fits, but its published stable compatibility matrix does not cover this repo's Zod 4 and React 19 stack.
6. Generate OpenAPI as a secondary interoperability artifact if native iOS/Android, third-party, or non-TypeScript clients become a real requirement. Do not make generated TypeScript code a second source of truth for the in-repo web/mobile clients.

There is no mobile application in the workspace today. “Mobile compatibility” below means suitability for a future React Native consumer unless otherwise stated.

## What was inspected

### Workspace manifests and orchestration

| Path                                      | Package                   | Direct runtime deps | Direct dev deps | Role                                         |
| ----------------------------------------- | ------------------------- | ------------------: | --------------: | -------------------------------------------- |
| `package.json`                            | `ninja-turbo`             |                   0 |               4 | Root scripts and toolchain                   |
| `apps/backend/package.json`               | `backend`                 |                  18 |              18 | Nest API, auth, TypeORM, BullMQ producer     |
| `apps/web/package.json`                   | `web`                     |                  14 |              22 | React/Vite/TanStack web client               |
| `apps/worker/package.json`                | `worker`                  |                   5 |               7 | Bun BullMQ consumer and email sender         |
| `packages/contracts/package.json`         | `@repo/contracts`         |                   1 |               7 | Shared HTTP schemas/contracts                |
| `packages/email/package.json`             | `@repo/emails`            |                   2 |              10 | React Email templates                        |
| `packages/eslint-config/package.json`     | `@repo/eslint-config`     |                  12 |               2 | Shared flat ESLint configuration             |
| `packages/jobs/package.json`              | `@repo/jobs`              |                   1 |               7 | Shared queue definitions and payload schemas |
| `packages/types/package.json`             | `@repo/types`             |                   0 |               7 | Empty shared-types placeholder               |
| `packages/typescript-config/package.json` | `@repo/typescript-config` |                   0 |               0 | Shared TypeScript configurations             |

Also inspected: `pnpm-lock.yaml` (lockfile version 9), `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`, the Better Auth TypeORM patch, all shared TypeScript configs, package scripts, and representative backend/web/worker consumers.

### Commands run

- `pnpm outdated -r --format json`
- `pnpm audit --json`
- `pnpm audit --prod --json`
- `pnpm knip`
- `pnpm exec knip --dependencies --reporter json --no-exit-code`
- `pnpm install --frozen-lockfile`
- `pnpm build`, `pnpm check-types`, `pnpm test`, and `pnpm lint`
- targeted `pnpm list`, `pnpm why`, and `pnpm view` registry queries
- source searches for imports, generated boundaries, runtime use, schema parsing, and unused packages

`pnpm outdated` exits 1 when updates exist; that exit is expected. A frozen install was run to test clean-checkout behavior, but no `pnpm update`, package rewrite, manifest change, configuration change, or lockfile rewrite was performed.

## Architecture audit

### Overall assessment

Use an evolutionary modular-monolith design. The current NestJS, React/Vite, TanStack Router/Query, Zod, BullMQ, Bun, Turborepo, React Email, and Better Auth choices are reasonable. The main weakness is not a missing framework; it is that the interfaces between the existing frameworks are only partly enforced.

In this report, complete end-to-end type safety means both:

- compile-time inference from one canonical boundary definition; and
- runtime validation whenever untrusted data crosses HTTP, Redis, environment, database, or provider boundaries.

TypeScript alone cannot make network, queue, persisted, or vendor data safe.

```text
apps/web ----\
              +--> @repo/api-client --> @repo/contracts --> HTTP --> Nest feature modules
apps/mobile -/                                                  |
                                                               +--> application services
                                                                      |
                                                                      +--> database/provider ports
                                                                      +--> @repo/jobs --> Redis/BullMQ
                                                                                          |
                                                                                          +--> typed worker registry

web/mobile Better Auth clients --> Better Auth routes --> official PostgreSQL adapter
```

There is no mobile application in the repository today. A future `apps/mobile` can reuse contracts and a portable transport, but it cannot reuse the current web API/auth clients because they depend on Vite environment variables, browser cookie behavior, `better-auth/react`, React DOM, and TanStack Router.

### Current boundary map

| Boundary                 | What is safe today                                                                                                    | What is not enforced                                                                                             | Assessment                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Web -> demo API          | Shared Zod request/query/response schemas; Nest request validation; Nest response serialization; web response parsing | Method, path, query/body placement, status codes, headers, and errors are manually paired                        | Good payload slice, not full endpoint safety                 |
| Web -> health API        | TanStack Query wrapper                                                                                                | Response is a local TypeScript assertion; no shared schema or runtime parse                                      | Unsafe contract seam                                         |
| Web -> Better Auth       | Better Auth client inference                                                                                          | Separate unused auth schemas disagree about datetime representation; all session errors become logged-out `null` | Two competing models and incorrect failure semantics         |
| Backend -> worker        | Shared literal job definitions and Zod payloads; producer and handler both parse                                      | Job name-to-payload correlation is erased; handlers are not exhaustive; unknown jobs complete successfully       | Strong runtime payload validation, weak protocol typing      |
| Worker -> Resend         | Injectable adapter and meaningful unit tests                                                                          | The port accepts `Record<string, unknown>` and casts through the SDK                                             | Useful seam that can be narrowed                             |
| Backend -> PostgreSQL    | TypeORM entities/migrations exist                                                                                     | No real business repository flow; duplicate data sources; malformed entity glob; auth timestamps use `date`      | Auth correctness risk; domain architecture is not yet proven |
| Process -> environment   | Some manual defaults/parsers                                                                                          | Backend and worker parse the same Redis settings differently; malformed values may be silently accepted          | Not runtime type-safe                                        |
| Turbo -> shared packages | Compiled ESM/CJS packages work after build                                                                            | Consumer checks/tests can start before ignored `dist` declarations exist                                         | Clean-checkout graph is broken                               |

The only application HTTP vertical slice is the in-memory `demo` module. There is no controller -> application service -> repository -> entity flow from which to conclude that the persistence architecture is production-ready.

### Strengths to preserve

- `@repo/contracts` and `@repo/jobs` are runtime-safe, platform-neutral leaves whose types are inferred from Zod rather than duplicated.
- The demo controller is thin, and TanStack Query/router loading patterns are broadly sound.
- Queue payloads are validated on both producer and consumer, protecting rolling deployments from malformed messages.
- Worker logging, Resend access, and client construction are injectable and already have useful unit coverage.
- The workspace dependency direction is mostly acyclic: applications depend inward on shared protocol packages.
- The backend is still a modular monolith. Keeping that deployment shape is simpler and more extensible than prematurely splitting services.

### Highest-priority implementation findings

| Priority | Finding                                                                                                             | Evidence                                                                                                                                  | Required decision                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Critical | Auth persistence truncates instants to calendar dates, including session expiry                                     | `apps/backend/src/entities/Session.ts:8-18` and `apps/backend/src/migrations/1772822691769-create-session.ts:19-34` use PostgreSQL `date` | Inspect the real database, then rehearse a precise timestamp migration with rollback                 |
| Critical | Auth spans unsupported peers and a locally patched community adapter                                                | Nest is 10.4.20; `@thallesp/nestjs-better-auth@2.4.0` peers with Nest 11; `@hedystia/better-auth-typeorm@0.8.0` has a 155-line patch      | Treat Nest, Better Auth, adapter, and schema as one tested migration, not independent bumps          |
| High     | Better Auth receives a different `DataSource` from Nest, while entity discovery does not match the entity filenames | `apps/backend/src/app.module.ts`, `apps/backend/src/lib/auth.ts`, and `apps/backend/src/config/database.config.ts:32`                     | Give one module explicit database ownership; preferably remove TypeORM from auth                     |
| High     | JSON parsing is restored only for `/demo` after global `bodyParser: false`                                          | `apps/backend/src/main.ts:5-18`                                                                                                           | Fix the general application request boundary before adding `/esims`, `/orders`, or other POST routes |
| High     | The generic web client can assert any response for any string path                                                  | `apps/web/src/lib/api.ts:37-44,162-179`                                                                                                   | Replace it with a contract-bound, runtime-validating transport                                       |
| High     | Unknown worker job names are logged and returned as success                                                         | `apps/worker/src/jobs/index.ts:24-39`                                                                                                     | Make handler registration exhaustive; fail or deliberately dead-letter unknown work                  |
| High     | Email errors classified as retryable have no configured retry budget                                                | `apps/backend/src/modules/background-jobs/background-jobs.service.ts:41-47`                                                               | Put attempts, backoff, retention, timeout, and idempotency policy beside each job definition         |
| High     | Fresh-checkout checks depend on generated `dist`, but the Turbo graph does not build it                             | shared package `exports` plus `turbo.json:10-12`                                                                                          | Make consuming checks/tests depend on dependency builds or adopt a source-aware package strategy     |
| High     | Backend and web test scripts succeed with zero tests                                                                | package scripts use `--passWithNoTests`; no backend/web test files were found                                                             | Add seam-level tests before coordinated upgrades                                                     |
| Medium   | Auth session transport failures are cached as unauthenticated success                                               | `apps/web/src/queries/auth.ts:13-23`                                                                                                      | Preserve unavailable/error states; only an actual unauthenticated response should become `null`      |
| Medium   | The router auth context is a non-reactive snapshot and is unused by routes                                          | `apps/web/src/router-context.ts:4-7`, `apps/web/src/router.tsx:25-30`                                                                     | Remove it or populate route context from an awaited session in `beforeLoad`                          |
| Medium   | Global API errors, Better Auth errors, and response-contract failures have different shapes                         | `apps/backend/src/app.module.ts:17-22`, `apps/web/src/lib/api.ts:59-79`                                                                   | Normalize application errors globally and represent client-side contract violations separately       |

### Recommended package boundaries

| Package                           | Single responsibility                                                             | Allowed dependency direction       |
| --------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| `@repo/contracts`                 | Feature-scoped Zod schemas, endpoint metadata, and application API errors         | Zod only                           |
| `@repo/api-client` (new)          | Platform-neutral Fetch executor inferred from endpoint contracts                  | `@repo/contracts`                  |
| `@repo/jobs`                      | Queue/job schemas, typed producer/handler helpers, and execution policy           | Zod only                           |
| `@repo/emails`                    | Pure email rendering                                                              | React/email libraries only         |
| TypeScript/ESLint config packages | Tooling policy                                                                    | Tooling only                       |
| Deployable apps                   | Composition, framework adapters, UI, auth, persistence, and provider integrations | Shared packages; never another app |

Do not preserve a generic shared-types bucket. `packages/types/src/index.ts` is empty and no runtime source imports `@repo/types`. Remove it. If a real business rule later needs to run in several runtimes, extract a focused package such as `@repo/esim-domain`; wire types remain beside their Zod schemas.

Prefer feature subpath exports such as `@repo/contracts/esims` and `@repo/jobs/email` over indefinitely growing root barrels. Add package-boundary lint rules so deployable or provider-specific code cannot leak back into browser-safe protocol packages.

### Backend extensibility rule

Keep feature modules cohesive and introduce layers only where a real seam exists:

```text
modules/esims/
  esim.module.ts
  esim.controller.ts       # HTTP contract adapter
  esim.service.ts          # workflow, policy, transaction boundary
  esim.repository.ts       # only when persistence exists
  providers/               # carrier/vendor adapters only when needed
```

Controllers translate HTTP contracts to use cases; services own workflows; repository/provider adapters own TypeORM, vendor SDKs, queues, and external HTTP. Never export TypeORM entities as API models. Add an interface at a replaceable or independently testable boundary, not around every class.

A normal new feature should require one contract slice, one Nest feature module, one query module per client, and optional job definitions. It should not require editing global routers, generic type buckets, or several handwritten copies of the same request/response type.

### Authentication and persistence direction

Retain Better Auth, but the preferred target is Better Auth's official direct PostgreSQL adapter instead of the patched community TypeORM adapter. Better Auth should own its auth schema and migration lifecycle. TypeORM should then become a separate eSIM-domain decision:

- keep it only if near-term business persistence will actually use it, confined behind feature repository adapters; or
- remove `@nestjs/typeorm`, the current auth entities/config, and the unused migration wrapper after auth moves to official PostgreSQL.

Do not adopt Drizzle, Prisma, or another ORM merely to claim stronger type safety. There is no business-domain schema yet that justifies an ORM rewrite. If TypeORM remains, first patch to the secure 0.3 line, correct entity discovery and timestamp types, and prove it with a real feature/repository integration test.

Better Auth routes should stay outside the application endpoint registry because Better Auth already supplies typed platform clients. Use its inferred server/client session model instead of the unused string-datetime schemas in `packages/contracts/src/auth.ts`. Keep UI-only validation such as `confirmPassword` distinct from actual wire request schemas. For Expo, use Better Auth's mobile integration and inject platform session/header behavior into the portable application API client.

### Typed asynchronous boundary

Deepen `@repo/jobs` without turning it into a queue framework. Derive these from the existing queue definition:

- `enqueue(jobDefinition, payload)`, preserving literal name-to-payload inference;
- `HandlerMap<typeof BACKGROUND_TASKS_QUEUE>`, requiring every known job;
- a `satisfies`-checked worker registry;
- runtime parsing at the consumer even after compile-time inference;
- shared attempts, backoff, retention, idempotency, timeout, and payload-version policy.

Unknown names and malformed payloads should fail or enter a deliberate dead-letter path, never complete silently. Move `queuedJobResponseSchema` from `@repo/jobs` to `@repo/contracts`; it describes an HTTP response, not a Redis message.

### Keep, replace, and remove

| Keep                                      | Replace or tighten                                                                     | Remove after verification                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Nest feature modules                      | Free-form Axios generic -> contract-bound Fetch client                                 | Empty `@repo/types`                                                             |
| Zod 4 boundary schemas                    | Untyped job union/map -> exhaustive typed registry                                     | Patched Hedystia auth adapter                                                   |
| React, Vite, TanStack Router/Query        | Ad hoc environment access -> per-process startup schemas                               | Tournament/Ninja/Vercel template naming and samples                             |
| BullMQ and the worker's tested adapters   | Auth `date` columns -> precise timestamp migration                                     | Axios after the portable client migration                                       |
| Better Auth                               | Disabled global guard -> default-protected business routes with explicit public routes | TypeORM if it has no business-domain use                                        |
| Turborepo and compiled workspace packages | Node 20/unpinned container tools -> repository-pinned runtimes/Corepack                | Broad pnpm hoisting after peer repair                                           |
| React Email/Resend boundary               | Broad Resend payload cast -> SDK-derived narrow port                                   | Unused UI, stale environment keys, and sample assets after product confirmation |

The repository still contains `ninja-turbo`, Tournament Hub defaults, demo-only data, and Vercel sample email material. Remove template residue after the first real eSIM vertical slice replaces it; until then, label any retained demo explicitly so nobody mistakes it for a production persistence example.

## Baseline runtime and package-manager findings

Observed locally:

| Component | Repository declaration   | Active local executable | Current stable/relevant line                                                   | Finding                                                                                                                                                                                                                                          |
| --------- | ------------------------ | ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node.js   | `>=22`                   | `24.18.0`               | Node 24 is the current LTS line                                                | An open-ended lower bound does not reproduce the runtime; pin Node 24.x in development and deployment. Node recommends Active or Maintenance LTS for production. [Node release policy](https://nodejs.org/en/about/previous-releases)            |
| pnpm      | `9.0.0`                  | `9.0.0`                 | `11.24.0` is `latest`; `12.0.0` is only `next-12` and was published 2026-08-26 | Upgrade 9 -> 11 first. Do not adopt pnpm 12 one day after its prerelease channel publication. pnpm 11 requires Node `>=22.13`. [pnpm installation/compatibility](https://pnpm.io/installation)                                                   |
| Bun       | undeclared               | `1.3.14`                | registry types have already moved beyond the installed runtime                 | Pin Bun explicitly and keep `@types/bun` on the same supported line. The worker build and tests are Bun-specific even though most production source is Node-compatible.                                                                          |
| Turborepo | `^2.5.8`, locked `2.5.8` | `2.5.8`                 | registry `2.10.12`                                                             | Update after pnpm settings are repaired. Current Turbo is also within the affected range of its local-login CSRF advisory; patched `>=2.9.14`. [Turborepo advisory](https://github.com/vercel/turborepo/security/advisories/GHSA-hcf7-66rw-9f5r) |

### The current pnpm configuration is not reproducible

Every pnpm command emitted:

> The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.patchedDependencies".

The repository currently puts `patchedDependencies` under the root `package.json`, and puts `shamefully-hoist`, `public-hoist-pattern`, `strict-peer-dependencies`, and `enable-pre-post-scripts` in `.npmrc`. Current pnpm documentation says project settings belong in `pnpm-workspace.yaml`; only registry/authentication settings remain in `.npmrc`. [pnpm settings](https://pnpm.io/settings)

The lockfile still records the existing patch hash and path, so the already-locked graph knows about the patch. The danger is the next lockfile regeneration: the live pnpm process says it is ignoring the source setting. Move the patch declaration to the supported workspace configuration before any dependency update. The official patch workflow records patches through `patchedDependencies`. [pnpm patch](https://pnpm.io/cli/patch)

The `.npmrc` is internally contradictory as well: `shamefully-hoist=true` plus `public-hoist-pattern[]=*` broadly exposes dependencies at the root, while the comment says it uses an isolated linker. Broad hoisting and `strict-peer-dependencies=false` can hide undeclared imports and unsupported peer combinations. Restore an isolated layout and strict peers only after the existing peer/version mismatches are resolved, because flipping them immediately can break the install graph.

### The Better Auth patch is a high-risk upgrade seam

`patches/@hedystia__better-auth-typeorm@0.8.0.patch` changes the published adapter's built JavaScript to add database-driver-specific parameter placeholders, date column types, JSON/date normalization, and affected-row handling. This is correctness code at the authentication persistence boundary, not a cosmetic patch.

The adapter is explicitly listed by Better Auth as a **community adapter**, not an officially maintained database adapter. [Better Auth community adapters](https://better-auth.com/docs/adapters/community-adapters) Better Auth's built-in Kysely path supports core relational dialects directly, while other ORM adapters have their own schema/migration behavior. [Better Auth database docs](https://better-auth.com/docs/concepts/database)

The current adapter is `0.8.0`; the registry latest is `1.1.0`. The preferred outcome is to remove this seam by moving Better Auth to its official direct PostgreSQL adapter. If the community TypeORM adapter must remain temporarily, do not blindly port the patch. First:

1. Run the auth adapter integration suite against unpatched `1.1.0` on the actual database.
2. Verify the upstream version fixes every behavior represented in the local patch.
3. Delete the patch if it is no longer needed.
4. If it remains necessary, either own a small internal adapter with database-backed tests or open/track upstream fixes. Repeatedly patching published `dist` files is the least maintainable option.

A wholesale TypeORM-to-Drizzle or TypeORM-to-Prisma rewrite is not justified by this dependency audit. TypeORM currently has no business-domain consumer, so decide it independently after auth no longer forces the choice.

## Security and dependency health

### Audit interpretation

`pnpm audit --json` reported 28 low, 148 moderate, 143 high, and 7 critical findings across a graph of 1,665 dependencies. Those are lockfile-level advisory matches, not 326 proven exploitable production paths. Better Auth, for example, exposes a broad optional plugin ecosystem, so optional Next/Prisma/test-tool paths inflate aggregate counts.

The following direct packages are still actionable regardless of that inflation:

| Direct package |    Locked |                                   Immediate safe target | Why it matters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------: | ------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `better-auth`  |   `1.5.4` |                                                 `1.7.2` | The current version matches multiple auth advisories. Some are conditional on plugins such as OIDC/MCP, organization, magic-link, or email OTP, so enabled-feature reachability must be reviewed, but auth should be upgraded even when a specific plugin is unused. The critical refresh-token advisory was patched in 1.6.11; the later pre-account-hijacking issue was patched in 1.6.22. [critical advisory](https://github.com/advisories/GHSA-pw9m-5jxm-xr6h), [account-hijacking advisory](https://github.com/advisories/GHSA-9wm3-rh5c-fc37) |
| `axios`        |  `1.13.6` |           `1.20.0`, or remove after the client decision | Current advisories include request-construction/prototype-pollution gadgets; the cited issue is patched in 1.18.0. [Axios advisory](https://github.com/advisories/GHSA-mmx7-hfxf-jppx)                                                                                                                                                                                                                                                                                                                                                               |
| `typeorm`      |  `0.3.28` |                                          `0.3.31` first | `0.3.28` precedes fixes for an `orderBy` SQL-injection issue and migration-template code injection. [TypeORM security page](https://github.com/typeorm/typeorm/security) Move to 1.x only as a separate migration.                                                                                                                                                                                                                                                                                                                                   |
| `@nestjs/core` | `10.4.20` | latest Nest 11 family first (`11.2.3` at research time) | The SSE injection issue affects `<=11.1.17` and is fixed in 11.1.18. [Nest advisory](https://github.com/nestjs/nest/security/advisories/GHSA-36xv-jgw5-4q75) Nest majors and integrations must move together.                                                                                                                                                                                                                                                                                                                                        |
| `vite`         |   `6.3.6` |                                           `6.4.3` first | The locked release precedes later Vite 6 security backports. Vite only backports security fixes to supported lines; the current overall stable is 8.2.2. [Vite release policy](https://vite.dev/releases), [Vite advisories](https://github.com/vitejs/vite/security/advisories)                                                                                                                                                                                                                                                                     |
| `vitest`       |  `4.0.18` |                                                `4.1.11` | Versions below 4.1.0 are affected by the critical UI-server file read/execution issue; additional browser-mode fixes landed later in 4.1.x. The repo currently runs CLI unit tests, which lowers reachability, but does not remove the reason to update. [Vitest advisories](https://github.com/vitest-dev/vitest/security)                                                                                                                                                                                                                          |
| `turbo`        |   `2.5.8` |                                               `2.10.12` | Patched for the self-hosted login callback issue in `>=2.9.14`; a current minor also reduces toolchain drift. [Turborepo advisory](https://github.com/vercel/turborepo/security/advisories/GHSA-hcf7-66rw-9f5r)                                                                                                                                                                                                                                                                                                                                      |

### Material current-to-latest snapshot

Registry metadata and `pnpm outdated` were checked on 2026-08-27. “Latest” is not automatically the recommended next commit.

| Area                            | Current locked/declaration           | Registry latest checked                | Migration note                                                                                                                                             |
| ------------------------------- | ------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node types                      | 18, 22, 24, and 25 across packages   | 26.4.0                                 | Align to runtime intent, not blindly to latest.                                                                                                            |
| pnpm                            | 9.0.0                                | 11.24.0 (`latest`), 12.0.0 (`next-12`) | Adopt 11 first.                                                                                                                                            |
| Turbo                           | 2.5.8                                | 2.10.12                                | Same major; update early.                                                                                                                                  |
| TypeScript                      | web 5.7.2; most workspaces 5.9.2     | 7.0.2                                  | Move all to 6.0.3 first; see compiler constraints below.                                                                                                   |
| ESLint / `@eslint/js`           | 9.37.0                               | 10.9.1 / 10.0.1                        | Flat config is already used; account for v10 config lookup changes. [ESLint v10 guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)               |
| `typescript-eslint`             | 8.58.0                               | 8.68.0                                 | Latest peers with ESLint 10 but only TypeScript `<6.1.0`; it does not support TS 7 as the primary compiler yet.                                            |
| Knip                            | 6.1.0                                | 6.32.3                                 | Centralize at root.                                                                                                                                        |
| Prettier                        | backend 2.8.8; web 3.3.3; root 3.6.2 | 3.9.6                                  | Use one root version.                                                                                                                                      |
| Nest core/platform/testing      | 10.4.20                              | 12.0.1                                 | Upgrade 10 -> 11 first. Nest 12 was published during this research window and partner peer support is not yet uniform.                                     |
| `@nestjs/config`                | 3.3.0                                | 12.0.0                                 | Coordinate with the selected Nest major.                                                                                                                   |
| `@nestjs/swagger`               | 7.4.2                                | 12.0.0                                 | Coordinate with Nest; do not update in isolation.                                                                                                          |
| `@nestjs/bullmq`                | 10.2.3                               | 12.0.0                                 | Coordinate with Nest and BullMQ.                                                                                                                           |
| `@nestjs/typeorm`               | 11.0.0                               | 12.0.0                                 | 11.0.1+ is the TypeORM 1-compatible Nest bridge; 12 supports Nest 12.                                                                                      |
| TypeORM                         | 0.3.28                               | 1.1.0                                  | Security patch to 0.3.31 first; major later.                                                                                                               |
| BullMQ                          | 5.70.4                               | 6.3.1                                  | Backend producer and Bun worker must move together.                                                                                                        |
| Better Auth                     | 1.5.4                                | 1.7.2                                  | Security-first coordinated update with both community integrations.                                                                                        |
| `@hedystia/better-auth-typeorm` | 0.8.0 + local patch                  | 1.1.0                                  | Test upstream before porting patch.                                                                                                                        |
| `@thallesp/nestjs-better-auth`  | 2.4.0                                | 2.7.0                                  | Update with Better Auth/Nest and run HTTP auth integration tests.                                                                                          |
| `nestjs-zod`                    | 5.1.1                                | 5.5.0                                  | Keep during Nest 10/11; reassess only after target Nest's built-in schema support is proven.                                                               |
| React / React DOM               | 19.2.4                               | 19.2.8                                 | Patch together.                                                                                                                                            |
| TanStack Query                  | 5.90.2                               | 5.102.7                                | Low-risk minor after contract-client tests.                                                                                                                |
| TanStack Router                 | 1.166.2                              | runtime 1.170.32; CLI 1.167.33         | Do not independently chase the two “latest” tags. Select a published runtime/CLI pair and verify route generation/build.                                   |
| Axios                           | 1.13.6                               | 1.20.0                                 | Upgrade immediately or replace with Fetch in the shared client.                                                                                            |
| Vite / React plugin             | 6.3.6 / 4.7.0                        | 8.2.2 / 6.1.0                          | Upgrade Vite 6.4 -> 7 -> 8; Vite 8 changes the build engine and plugin-react 6 peers with Vite 8. [Vite migration guide](https://vite.dev/guide/migration) |
| Vitest                          | 4.0.18                               | 4.1.11                                 | Security patch within major.                                                                                                                               |
| Tailwind / Vite plugin          | 4.1.14 / 4.2.0                       | 4.3.3 / 4.3.3                          | Keep the Tailwind family aligned.                                                                                                                          |
| Zod                             | 4.3.6                                | 4.4.3                                  | Keep every contract producer/consumer on one catalog entry.                                                                                                |
| React Compiler Babel plugin     | dated 19 beta                        | 1.0.0                                  | Move to stable and exact-pin as React recommends. [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)                                 |
| React compiler ESLint plugin    | dated 19 beta                        | 19.1.0-rc.2                            | Remove after moving compiler rules to current `eslint-plugin-react-hooks`; React says compiler lint rules are included there.                              |
| React Email CLI                 | 5.0.7                                | 6.9.3                                  | Upgrade as one email toolchain change and render-test templates.                                                                                           |
| Resend                          | 6.10.0                               | 6.24.0                                 | Minor update; run sender tests.                                                                                                                            |
| `@react-email/components`       | 1.0.1                                | 1.0.12, package metadata deprecated    | Do not merely update to another deprecated release; confirm the React Email-supported import/package path during the email upgrade.                        |
| `@react-email/preview-server`   | 5.0.7                                | 5.2.10, package metadata deprecated    | Remove the direct declaration if current `react-email` owns preview startup; verify the email dev command.                                                 |

Smaller patch/minor backlog also exists for `@types/react`, `@types/react-dom`, `react-error-boundary`, `ts-jest`, `tsup`, `@tailwindcss/typography`, `eslint-plugin-import-x`, `eslint-plugin-jest`, `eslint-plugin-no-only-tests`, `eslint-plugin-promise`, `eslint-plugin-security`, `eslint-plugin-sonarjs`, `radix-ui`, `tailwind-merge`, `ts-loader`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier-plugin-tailwindcss`, `reflect-metadata`, and `globals`. These should be updated with their owning toolchain rather than as one undifferentiated bulk PR.

## Version mismatches and dependency cleanup candidates

### 1. TypeScript 7 is not a direct upgrade

TypeScript 7 is a native compiler transition. Its 7.0 release does not yet expose the programmatic compiler API expected by tools; Microsoft recommends keeping TypeScript 6 available for tools such as typescript-eslint. It also adopts TypeScript 6 breaking defaults, and `baseUrl` is removed. [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

This repo's shared Vite config still uses `baseUrl`, the web workspace is on 5.7.2, other workspaces are on 5.9.2, and current `typescript-eslint@8.68.0` peers with `typescript >=4.8.4 <6.1.0`. Therefore:

- align the repo on TypeScript 6.0.3 first;
- clear deprecations and remove `baseUrl` assumptions;
- keep TS 6 as the tooling compiler;
- pilot TS 7 side by side only after the framework/build plugins support it.

### 2. Node ambient types do not describe the actual runtimes

Current declarations:

- backend and worker: exact `@types/node@18.15.11`;
- web: `@types/node@^22.13.9`;
- contracts/jobs/types: `@types/node@^24.7.2`;
- email: exact `@types/node@25.0.0`;
- actual local Node: 24.18.0;
- worker additionally has `@types/bun` and compiles/tests with Bun.

Recommended rule:

- Node services/tooling use Node 24 types matching the pinned Node 24 runtime;
- the Bun worker uses a pinned Bun runtime and matching Bun types, adding Node types only for APIs it intentionally supports;
- browser-neutral `contracts` and `jobs` packages should not depend on Node ambient types unless source code actually uses Node APIs.

This prevents a shared package from compiling because of ambient APIs that are unavailable in a browser or React Native bundle.

### 3. Express runtime and types are split

Nest 10 currently resolves Express 4.21.2, while backend directly declares `@types/express@5.0.6`. Use Express 4 types while Nest 10 remains. Nest 11 changes the default platform to Express 5, including route-path and query parsing changes, so move runtime and types together during that migration. [Nest 10-to-11 migration guide](https://docs.nestjs.com/migration-guide)

### 4. Formatting and analysis tools are duplicated

- Knip is a devDependency of the root and eight workspaces even though workspace scripts invoke the root binary with `pnpm --dir ../.. exec knip`. Keep the binary only at the root.
- Prettier exists at three major/minor levels. Backend has no format script, and its `eslint-config-prettier` is not consumed by its current config. Centralize Prettier at root; remove backend-local Prettier/config if no actual consumer appears in implementation.
- A pnpm catalog in `pnpm-workspace.yaml` can keep React, Zod, TypeScript, ESLint, Node types, and shared build tools synchronized. pnpm documents catalogs as a workspace-level version consistency mechanism. [pnpm catalogs/settings](https://pnpm.io/settings#catalogs)

### 5. `@repo/types` is an empty architectural placeholder

`packages/types/src/index.ts` is empty, and source search found no imports of `@repo/types` outside its own instructional `AGENTS.md`. The package still adds build/lint/typecheck/Knip work and overlaps conceptually with inferred Zod contract types.

Delete it until a real low-level, platform-neutral type or utility needs to be shared. Domain transport types should stay inferred from schemas in `@repo/contracts` or `@repo/jobs`, not be duplicated in a generic types bucket.

### 6. Knip source findings

`pnpm exec knip --dependencies --reporter json --no-exit-code` reported no unused or unlisted dependency issues. The full Knip run did report web source cleanup:

- unused file: `apps/web/src/components/ui/tabs.tsx`;
- unused exports: `buttonVariants`, `CardAction`, and `authQueryKeys`.

These are cleanup candidates, not proof that the components can be removed without checking pending/near-term feature work.

## Major migration constraints

### Nest 10 -> 11 -> 12

Nest 11 requires Node 20+, changes the default Express platform to Express 5, changes wildcard route syntax/query parsing, and changes dynamic-module identity behavior. [Nest migration guide](https://docs.nestjs.com/migration-guide)

Nest 12 packages appeared during this research window. Registry metadata showed 12.0.0/12.0.1 while several ecosystem integrations still advertised support only through Nest 11. Treat 12 as a later compatibility project, not the security hotfix target. Move the complete Nest family to current Nest 11 first, including CLI/testing/swagger/config/platform packages, then validate auth, TypeORM, BullMQ, `nestjs-zod`, middleware paths, and integration tests.

### TypeORM 0.3 -> 1.x

First install the security-fixed 0.3.31 line. TypeORM 1 raises the floor to Node 20 and ES2023, removes long-deprecated APIs, changes some driver requirements, and provides an official codemod. It requires `@nestjs/typeorm >=11.0.1` for the Nest integration. [TypeORM 1.0 release](https://typeorm.io/blog/typeorm-1-0/), [0.3-to-1.0 upgrading guide](https://typeorm.io/docs/releases/1.0/upgrading-from-0.3/)

Run the codemod in dry-run mode during implementation, review database-driver requirements, and rerun the auth-adapter integration matrix. Do not combine this with a Nest major or auth storage replacement.

### BullMQ 5 -> 6

Upgrade to the latest BullMQ 5 first. BullMQ 6 removes legacy repeatable-job APIs and stored metadata in favor of Job Schedulers, removes debounce in favor of deduplication, makes `Queue.resume()` async, and changes some flow IDs/telemetry. Every producer and worker must be on the compatible deployment path before v6 encounters old repeat metadata. [BullMQ v5-to-v6 guide](https://docs.bullmq.io/guide/migrations/migrate-from-v5-to-v6)

No legacy repeat APIs were found in current source, which lowers migration effort, but Redis integration tests and a coordinated backend/worker rollout are still required.

### Vite 6 -> 7 -> 8

Patch to the supported Vite 6.4 line first, then follow official migration guides through 7 and 8. Vite 8 uses a newer build engine/toolchain, and current plugin-react 6 peers specifically with Vite 8 and the stable React Compiler plugin. [Vite migration guide](https://vite.dev/guide/migration)

### ESLint 9 -> 10

The repo already uses flat config, so it avoids the largest v10 removal. ESLint 10 changes config-file lookup to start from each linted file and raises the Node floor. In a monorepo this can change which config a nested file receives; run every workspace lint command and the root lint graph. [ESLint v10 release](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/)

## End-to-end HTTP contract options

### Current state and the actual gap

The repo already has runtime Zod schemas in `@repo/contracts`. Backend demo endpoints wrap them with `createZodDto`, global request validation, and `ZodSerializerDto`; demo web queries parse responses with the same schemas. That is a good vertical slice.

It is not yet end-to-end enforced:

- `apps/web/src/lib/api.ts` returns `response.data` as a generic `TResponse` without parsing it;
- health response types are re-declared locally and not parsed;
- method, path, request schemas, status codes, success schemas, and error schemas are not grouped into one route definition;
- a controller can be added without a shared contract, and a client can call a path using an asserted generic;
- there is no mobile client package yet.

The queue boundary is stronger: `@repo/jobs` owns named job definitions and Zod payload schemas, producers validate before enqueueing, and workers parse again before processing. The HTTP boundary should copy that ownership model.

### Comparison matrix

| Option                                   | Browser + React Native                                                                                                                                                                                                           | One contract, no duplication                                                                                            | Runtime validation                                                                                                                                                                                                                                            | Server implementation enforcement                                                                       | Codegen burden                                                                                  | Maintenance/fit today                                                                                                                                                                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared Zod + a small shared Fetch client | Yes. React Native provides Fetch, and TanStack Query supports React Native. [RN networking](https://reactnative.dev/docs/network), [TanStack Query install](https://tanstack.com/query/latest/docs/framework/react/installation) | Yes, if route metadata joins method/path/request/responses and types are inferred                                       | Strong when requests and responses are parsed at both boundaries                                                                                                                                                                                              | Partial by default; can be made strong with controller adapters and contract conformance tests          | None                                                                                            | Best immediate fit; all core pieces already exist                                                                                                                                                                                                                                           |
| oRPC v2 contract-first                   | First-party Fetch, TanStack, Nest, and Expo paths exist. [Nest integration](https://orpc.dev/docs/openapi/integrations/implement-contract-in-nest), [Expo adapter](https://orpc.dev/docs/adapters/expo)                          | Yes                                                                                                                     | Strong input/output/error schemas through Standard Schema                                                                                                                                                                                                     | Strong through Nest `@Implement` contracts                                                              | None                                                                                            | Very strong future fit, but the new contract-first and Nest instructions currently install `@beta`; v2 docs and migration material were published in this research week. ESM-only Nest integration is another migration seam. Hold for stabilization.                                       |
| ts-rest Nest + React Query               | Fetch-based core client and React Query integration make RN plausible; explicit RN support is not documented, so validate in a spike                                                                                             | Yes; contract-first and no client codegen                                                                               | Strong request/response support; response validation must be enabled and strict status handling configured. [contract docs](https://ts-rest.com/contract/overview), [React Query client](https://ts-rest.com/client/react-query-v5)                           | Strong: Nest handlers implement a typed contract                                                        | None                                                                                            | Best conceptual fit, but not compatible enough today: stable 3.52.1 peers with Zod 3 and React <=18; Zod 4/Standard Schema is only 3.53.0-rc.1, whose peers still stop at React 18 and Nest 11. Registry publication stopped in June 2025. Do not build the target architecture on this RC. |
| Nest OpenAPI + generated clients         | Yes. TypeScript Fetch works in browser/RN; generator also has Kotlin and Swift client targets. [generator list](https://openapi-generator.tech/docs/generators/)                                                                 | One language-neutral specification, but decorators/schema generation can drift from runtime Zod unless wired and tested | Nest validation remains separate; generated `typescript-fetch` has runtime checks by default, but its feature matrix omits several union/composition features. [typescript-fetch generator](https://openapi-generator.tech/docs/generators/typescript-fetch/) | Weaker at compile time: controller code can diverge until the generated spec/conformance tests catch it | Highest: generate, diff/check, publish or consume artifacts, and regenerate on every API change | Mature and useful for public/polyglot SDKs; more machinery than this internal TypeScript monorepo needs today                                                                                                                                                                               |
| tRPC                                     | TypeScript fetch client and React Query support make web/RN viable                                                                                                                                                               | Yes, via exported router types; no codegen                                                                              | Standard Schema/Zod validators can validate inputs and outputs                                                                                                                                                                                                | Strong inside the tRPC router                                                                           | None                                                                                            | Actively maintained, but official adapters list Express/Fastify/Fetch/etc., not Nest. [tRPC overview/adapters](https://trpc.io/) Adopting it means mounting a parallel protocol/framework or replacing Nest REST controllers. Not an incremental simplification.                            |
| Hono RPC                                 | Fetch-standard client is portable to web/RN                                                                                                                                                                                      | Yes, via exported `AppType`                                                                                             | Request validation via Zod/Standard Schema; response types come from handlers, not shared response schemas by default                                                                                                                                         | Strong inference inside Hono routes, with documented limits around global errors                        | None                                                                                            | Actively maintained, but Hono is a server framework replacement; on Node it needs its own adapter. [Hono RPC](https://hono.dev/docs/guides/rpc), [Hono on Node](https://hono.dev/docs/getting-started/nodejs) No clean incremental Nest integration.                                        |

### Option details and recommendation

#### A. Keep shared Zod, but make it route-first

This is the recommended next step. It is not “keep the current manual Axios generics.” The target should be:

- one domain contract module defines method, path, path/query/body/header schemas, status-indexed response schemas, and shared API error schemas;
- a platform-neutral Fetch transport accepts a contract endpoint and always validates the response selected by status;
- web wraps that transport with TanStack Query; React Native can reuse the transport and query-option factories without importing DOM code;
- Nest adapters/controllers consume the same endpoint definitions for input DTOs and response serialization;
- a contract conformance test enumerates every route and fails if the Nest HTTP surface, status, or serialized body diverges;
- raw `apiRequest<T>()` is internal-only or removed, so new code cannot bypass parsing.

Keep the abstraction small. Do not create a bespoke mini-framework with decorators, dependency injection, or custom query caching. The shared package should own data and route descriptions; Nest and TanStack remain the framework adapters.

Axios is not required for this design. React Native officially supplies Fetch, while Axios is also technically supported through XMLHttpRequest. Fetch reduces a dependency and makes the core transport portable; retain Axios only if interceptors/progress/adapter behavior provides measured value. React Native warns that cookie behavior has platform caveats, so mobile authentication should use an explicitly tested token/session strategy rather than assuming browser cookie semantics. [React Native networking](https://reactnative.dev/docs/network)

#### B. oRPC is promising but too fresh for this migration

oRPC v2 now models nearly the whole desired target: contract-first Zod/Standard Schema definitions, typed errors, a Nest `@Implement` adapter, Fetch/OpenAPI clients, TanStack Query, and an Expo adapter. [oRPC contract-first](https://orpc.dev/docs/contract-first), [oRPC Nest integration](https://orpc.dev/docs/openapi/integrations/implement-contract-in-nest)

It is the most compelling library to spike after the baseline is safe, but not to put underneath the first migration. The official contract-first installation currently uses `@beta`, the Nest integration is ESM-only, and the v2 contract/Nest/Expo documentation was published or updated during the week of this audit. Adding it while simultaneously moving Nest, Better Auth, pnpm, and the database would make fault isolation worse. Re-evaluate a stable release with one health/demo spike; if it proves sound, prefer it over expanding the small internal endpoint helper into a custom framework.

#### C. ts-rest is a hold, not a rejection

ts-rest directly models the desired architecture: a shared HTTP contract, Nest implementation, Fetch client, typed status/body results, React Query v5, runtime request/response schemas, and no codegen. Its docs explicitly recommend a shared contract and support strict status codes and bidirectional validation. [ts-rest contract](https://ts-rest.com/contract/overview)

The release matrix blocks production adoption today:

- stable `3.52.1`: `@ts-rest/core` peers with Zod 3; React Query peers with React 16-18; Nest peers with Nest 9-11;
- `3.53.0-rc.1`: adds Standard Schema/Zod 4, but React Query still peers only through React 18 and Nest still only through Nest 11;
- neither line advertises Nest 12;
- the latest stable and RC were published in March/June 2025 respectively, with no package publication since.

Re-evaluate when a stable release explicitly supports Zod 4 + React 19 + the chosen Nest major. At that point, run a small browser and React Native spike before committing the architecture.

#### D. OpenAPI should be an interoperability output

Nest can generate a language-neutral OpenAPI document from controllers. [Nest OpenAPI introduction](https://docs.nestjs.com/openapi/introduction) The Nest Swagger CLI plugin reduces decorator boilerplate, but Nest documents that TypeScript reflection cannot recover all schema information and that runtime validators remain necessary. [Nest Swagger CLI plugin](https://docs.nestjs.com/openapi/cli-plugin)

This is valuable when:

- the mobile app is native Swift/Kotlin rather than React Native;
- an external partner needs a stable API contract;
- another service is not TypeScript;
- the API document is a product artifact.

For the internal TS web/mobile path, generated clients add a generated artifact, a generator config/version, CI drift checks, and a regeneration workflow. If adopted, generate OpenAPI from the same runtime schemas/controllers and treat it as a checked output, not an independently hand-edited source.

#### E. Do not add tRPC or Hono beside Nest

tRPC and Hono are good actively maintained systems. They are not clean adapters for the existing Nest controller/module architecture. Adding either only for type inference would create two server programming models, two error/guard/middleware paths, and likely two API protocols. Consider them only if a later decision intentionally replaces Nest, not as a contract-layer dependency.

## Recommended program sequence

The order matters more than the individual version numbers. Each phase should be a series of small, independently revertible changes rather than one branch or one lockfile diff.

### Phase 0: correctness evidence and reproducibility

1. Inspect the real auth schema and data before altering it. Rehearse the `date` -> precise timestamp migration against a copy, including backup and rollback.
2. Add minimum integration coverage for Better Auth/PostgreSQL, normal Nest body parsing/error serialization, and one Redis producer/worker flow.
3. Pin Node 24.x and Bun consistently across engines, local setup, CI, and containers. Replace the backend Dockerfile's Node 20 and unpinned global pnpm/Turbo installs with the repository toolchain and Corepack.
4. Upgrade pnpm 9 -> 11.24.0, move supported settings and `patchedDependencies` into `pnpm-workspace.yaml`, and introduce catalogs for shared versions.
5. Update Turbo to 2.10.12 and make consumer checks/tests build dependency packages from a clean checkout. Scope task outputs and environment inputs by producer.
6. Validate backend and worker environment variables at startup with process-specific Zod schemas; fix general body parsing and define the default-protected/public-route policy.
7. Resolve known peers, then restore strict peer checks and reduce broad hoisting.

Gate: a clean checkout passes frozen install, build, check-types, lint, and tests without pre-existing `dist`; invalid environment values fail at startup; the auth migration retains time, timezone, and expiry behavior in rehearsal.

### Phase 1: directly exposed security and auth cohort

1. Move the complete Nest 10 family to the current secure Nest 11 line, including CLI/testing/platform/config/Swagger/BullMQ/TypeORM integrations, because the applicable Nest core fix is not available on the installed line.
2. Upgrade all Better Auth packages together to 1.7.2, align `@thallesp/nestjs-better-auth`, inspect the generated schema diff, and move auth persistence to the official PostgreSQL adapter.
3. Patch TypeORM to 0.3.31 before running migration tooling if TypeORM remains during this phase; do not combine that with TypeORM 1.x.
4. Replace Axios with the portable Fetch client if that narrow change is ready; otherwise patch Axios to 1.20.0 immediately.
5. Patch Vite to 6.4.3, Vitest to 4.1.11, React/React DOM, Zod, and the remaining directly actionable packages within their existing lines.
6. Exercise sign-up, email verification enqueueing, verification, sign-in, session refresh/expiry, sign-out, protected routes, PostgreSQL, and Redis in integration tests.

Gate: no locally patched auth adapter, no unresolved peer mismatch in the selected cohort, reviewed/rehearsed database migrations, and no known direct advisory left merely because a broad major upgrade was deferred.

### Phase 2: HTTP and queue protocol hardening

1. Add feature-scoped endpoint descriptors, starting with health and demo.
2. Add `@repo/api-client` as a small platform-neutral, runtime-validating Fetch executor; migrate web query factories and remove public generic response assertions.
3. Normalize application HTTP errors globally and distinguish transport, application, and contract-violation failures in clients.
4. Add Nest method/path/status/body conformance tests. Generate OpenAPI from the same runtime schemas as documentation/interoperability output, not as another hand-edited source.
5. Derive typed enqueue helpers and an exhaustive worker handler map from `@repo/jobs`; make unknown jobs fail or dead-letter deliberately.
6. Put retry, backoff, retention, timeout, idempotency, and payload-version policy beside job definitions.

Gate: changing a request, response, error, or job schema breaks all affected implementers/consumers at compile time; malformed boundary data fails at runtime; route drift, missing handlers, retries, and unknown jobs are tested.

### Phase 3: toolchain and remaining majors

1. Align all workspaces on TypeScript 6.0.3, one Prettier 3.9.x root install, root-only Knip, and synchronized Node/Bun ambient types.
2. Move ESLint 9 -> 10 only after every plugin peer range is verified and every workspace's monorepo config lookup is tested.
3. Move BullMQ 5 -> 6 in a coordinated backend/worker/Redis rollout.
4. Move Vite 6 -> 7 -> 8 with build, route generation, browser, and test validation at each major.
5. Move TypeORM 0.3 -> 1.x only if real eSIM repositories use it; otherwise remove it after auth migration.
6. Upgrade the React Compiler and email toolchains as their own render/build-tested changes.
7. Hold Nest 12 and TypeScript 7 until the relevant ecosystem peers and tooling support the target lines.

Gate: each cohort passes its own integration surface and has a separately reviewable lockfile diff; no major upgrade depends on an unrelated major landing simultaneously.

### Phase 4: first product slice, mobile, and cleanup

1. Build the first real eSIM vertical slice through contract -> portable client -> Nest service -> repository/provider -> optional job, proving the target shape before multiplying modules.
2. Add `apps/mobile` as an Expo consumer of `@repo/contracts` and `@repo/api-client`. Keep only platform auth, secure storage, navigation, and presentation in the mobile app.
3. Verify Better Auth's Expo integration, trusted origins/deep links, secure session persistence, refresh/recovery, and sign-out.
4. Remove demo routes, Tournament/Ninja/Vercel samples, empty `@repo/types`, stale environment keys, unused UI exports/assets, and stale documentation once the product slice replaces them.
5. Re-evaluate stable oRPC and ts-rest releases against Zod 4, React 19, Expo, and the chosen Nest line. Add generated SDKs only when a native or external consumer needs them.

Gate: web and mobile pass the same contract-client suite; mobile imports nothing from `apps/web`; Knip is clean; every package has a real consumer or a documented near-term purpose.

## Validation evidence from this pass

- `pnpm install --frozen-lockfile` succeeded, while warning that the current root `pnpm.patchedDependencies` setting is ignored.
- On the clean generated-output state, `pnpm check-types` and `pnpm test` failed because worker consumers could not resolve `@repo/jobs` and `@repo/emails` from their ignored `dist` outputs.
- `pnpm build` then passed the complete workspace build graph. The web build emitted an approximately 525 kB minified chunk warning, which is a future route-splitting/performance concern rather than a build failure.
- After build, `pnpm check-types` passed all workspace tasks.
- After build, `pnpm test` passed, but the result is asymmetric: the worker ran 16 useful tests; backend and web passed with zero tests.
- `pnpm lint` passed all linted workspaces.
- Full `pnpm knip` found one unused web file (`components/ui/tabs.tsx`) and unused exports `buttonVariants`, `CardAction`, and `authQueryKeys`; scoped backend/worker/contracts/jobs checks were clean.
- No PostgreSQL, Redis, deployed Better Auth, mobile, browser E2E, CI, staging, or production validation was performed. Static code and local package checks are not proof of those runtime environments.

## Decisions that should remain open until implementation tests

- Whether the official Better Auth PostgreSQL adapter reproduces every required production behavior immediately or a short, integration-tested community-adapter transition is necessary.
- Whether the deployed database/driver is fully ready for TypeORM 1.1.
- Whether the worker gains enough from Bun to justify a separate production runtime; current source is mostly portable, but build and tests are Bun-specific.
- Whether mobile means React Native (shared TypeScript client) or native Swift/Kotlin (OpenAPI-generated SDK becomes more valuable).
- Whether future stable ts-rest releases restore a supported React 19/Zod 4/Nest matrix and active release cadence.
- Whether a stable oRPC v2 release and its ESM Nest integration are mature enough to replace the deliberately small internal endpoint adapter.
- Which Better Auth plugins are enabled in production; advisory reachability depends on configuration even though the core upgrade is required.

## 2026-08-27 addendum: latest TypeORM adapter compatibility

This addendum supersedes the earlier recommendation to remove the TypeORM adapter immediately. The requested direction is viable, but installing the three latest releases without adapting the community adapter is not.

### Exact release and API result

As of this check, the current releases are `@hedystia/better-auth-typeorm@1.1.0`, `better-auth@1.7.2`, and `typeorm@1.1.0`. The adapter's 1.1.0 tag was published on August 15, before Better Auth 1.7 became stable on August 18. [Adapter 1.1.0 release](https://github.com/Zastinian/better-auth-typeorm/releases/tag/v1.1.0) [Better Auth 1.7.2 release](https://github.com/better-auth/better-auth/releases/tag/v1.7.2) [TypeORM 1.1.0 release](https://github.com/typeorm/typeorm/releases/tag/1.1.0)

The public call remains source-compatible:

```ts
typeormAdapter(dataSource, {
  migrationsDir,
  entitiesDir,
});
```

Version 1.1.0 retains those options and adds `outputDir`, opt-in `enableSchemaSync`, and `columnTypeOverrides`. Runtime schema synchronization defaults off and should remain off. Its declared peers are `better-auth: ^1.4.19` and `typeorm: ^1.0.0`; the TypeORM major is therefore a required part of this update. [1.1.0 package manifest](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/package.json) [1.1.0 options and factory configuration](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L735-L769)

### The old local patch is fully obsolete

Every semantic concern handled by `patches/@hedystia__better-auth-typeorm@0.8.0.patch` is present upstream:

| Local patch concern                                           | Upstream 1.1.0 result                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PostgreSQL driver-specific placeholders instead of `?`        | `createParameterToken` delegates to the TypeORM driver, and `buildWhereSql` supports a starting offset so `SET` and `WHERE` parameters do not collide. [Parameter and where construction](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L58-L70) [Where builder](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L980-L1088)               |
| PostgreSQL-compatible date type during schema synchronization | The driver mapping emits `timestamptz` for PostgreSQL/CockroachDB. [Date mapping](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L188-L211)                                                                                                                                                                                                                                             |
| Date and object normalization for raw writes                  | Dates and JSON-like values are normalized centrally; reads deserialize only schema-declared JSON/date/boolean fields instead of content-sniffing arbitrary strings. [Write normalization](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L72-L83) [Schema-aware deserialization](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L781-L827) |
| Insert/update placeholder handling                            | Create, update, and update-many use driver placeholders and correctly offset the predicate parameters. [Create path](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L1189-L1213) [Update paths](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L1298-L1420)                                                                                |
| Affected-row extraction for bulk update/delete                | Both operations request TypeORM's structured `QueryResult` and use its `affected` count. [Bulk result handling](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L1381-L1450)                                                                                                                                                                                                             |

These changes originated upstream across the PostgreSQL-placeholder, query-result, JSON, and runtime-DDL fixes. [PostgreSQL placeholder commit](https://github.com/Zastinian/better-auth-typeorm/commit/facfd40) [Query-result fix](https://github.com/Zastinian/better-auth-typeorm/commit/eafd363) [Schema-aware JSON/runtime-DDL fix](https://github.com/Zastinian/better-auth-typeorm/commit/f5044f8) The 0.8.0 patch and its `patchedDependencies` entry should be deleted when 1.1.0 lands; carrying it forward would patch code that no longer has the old shape.

### Better Auth 1.7 incompatibilities that require a new adaptation

The adapter's peer range is more permissive than its tested implementation. Its tagged test workspace pins Better Auth, its CLI, and test utilities to `^1.6.11`, while the PostgreSQL suite disables every transaction test. [Tagged test dependencies](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/test/package.json#L15-L40) [Tagged PostgreSQL suite](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/test/postgres.test.ts#L27-L56)

Better Auth 1.7 requires custom database adapters to implement two new atomic primitives:

- `consumeOne`: delete and return at most one matching row so a single-use credential has exactly one winner;
- `incrementOne`: apply guarded numeric increments and optional assignments atomically and return the updated row.

There is deliberately no portable fallback; Better Auth throws when either method is absent. [Official 1.7 custom-adapter migration requirements](https://better-auth.com/docs/guides/1-7-upgrade-guide#database-adapters-must-implement-incrementone-and-consumeone) [Factory enforcement](https://github.com/better-auth/better-auth/blob/v1.7.2/packages/core/src/db/adapter/factory.ts#L1346-L1505)

Adapter 1.1.0 implements neither method. A clean temporary install of the exact latest trio confirmed both runtime failures before any database connection:

```text
Adapter "typeorm" must implement consumeOne for atomic single-use credential consumption.
Adapter "typeorm" must implement incrementOne for atomic guarded counter updates.
```

This is reachable in this repository: Better Auth 1.7 uses `consumeOne` when consuming database-backed verification records, including the configured email-verification flow. [Verification consumption path](https://github.com/better-auth/better-auth/blob/v1.7.2/packages/better-auth/src/db/internal-adapter.ts#L818-L851)

The new project patch or maintained fork must therefore add native PostgreSQL implementations and matching concurrency tests before the Better Auth 1.7 upgrade is considered working. `consumeOne` should be one atomic delete-and-return operation that can remove no more than one row; `incrementOne` should be one guarded `UPDATE ... SET field = field + delta ... RETURNING *`. The implementations must reuse the adapter's transformed field names, driver parameters, row deserialization, and output transformation. Sequential `find` then `delete` or `find` then `update` is not an acceptable substitute because it reintroduces the race the 1.7 API removes.

The factory currently also declares no native transaction implementation, so Better Auth wraps calls in a sequential pass-through transaction. That is sufficient only for flows that do not require atomic multi-operation transactions. A TypeORM `QueryRunner`-backed implementation and the upstream transaction suite should be added before enabling transaction-dependent plugins such as the new SCIM workflow. [Factory's current transaction configuration](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L758-L769) [Better Auth transaction fallback](https://github.com/better-auth/better-auth/blob/v1.7.2/packages/core/src/db/adapter/factory.ts#L843-L857)

### Better Auth 1.7 schema migration

The core 1.7 schema adds required `account.issuer` and a unique compound index over `(issuer, accountId)`. Existing credential rows use `issuer = 'local:credential'` and retain the linked user's stable ID in `accountId`. Existing rows must be inventoried, backfilled, checked for collisions, made non-null, and then indexed; a generated migration cannot infer trusted issuers. [Official account-identity migration](https://better-auth.com/docs/guides/1-7-upgrade-guide#account-identity-is-scoped-by-issuer) [Core account schema](https://github.com/better-auth/better-auth/blob/v1.7.2/packages/core/src/db/get-tables.ts#L251-L292)

Adapter 1.1.0 does generate the new `issuer` field, but it does not consume Better Auth 1.7's table-level `indexes` collection. Its internal `ModelSchema` contains fields but no table-index member, and its create/alter generator only emits single-field metadata. [Adapter schema model](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L135-L148) [Adapter alter generator](https://github.com/Zastinian/better-auth-typeorm/blob/v1.1.0/package/src/typeorm-adapter.ts#L632-L709) Better Auth explicitly passes resolved table-level indexes to schema generators. [Better Auth schema output](https://github.com/better-auth/better-auth/blob/v1.7.2/packages/better-auth/src/db/get-schema.ts#L6-L55)

A generation probe using adapter 1.1.0 + Better Auth 1.7.2 produced `account.issuer`, the `account.userId` index, and the user foreign key, but omitted the required unique `(issuer, accountId)` index. The local adaptation must add table-index generation, and the migration must be reviewed manually.

The repository also needs to repair its pre-existing auth schema while making this change:

- replace every PostgreSQL auth `date` column with `timestamptz`; adapter 1.1.0 maps new output correctly, but its alter generator compares column names only and will not generate type changes;
- add `account.issuer` and the compound unique index;
- add the missing `session.userId` and `account.userId` indexes, `verification.identifier` index, and cascading foreign keys to `user.id`;
- fix the malformed entity glob so TypeORM actually registers `User.ts`, `Session.ts`, `Account.ts`, and `Verification.ts`;
- use one Nest-managed `DataSource` instead of the current Nest pool plus separately initialized `AppDataSource` pool.

For a disposable template database, the cleanest result is to regenerate a single current baseline after adapting the generator. If any database contains retained users, keep the existing migrations and add an ordered, rehearsed migration: timestamps first, nullable `issuer`, explicit backfill/collision check, `NOT NULL`, compound unique index, then the remaining indexes and foreign keys. Do not let `migrationsRun` discover an unreviewed generated `issuer NOT NULL` alteration during application startup.

TypeORM 1.1 itself is compatible with the repository's `DataSource`-based API, but its v1 upgrade changes runtime requirements and defaults: ES2023/Node 20+, a `throw` default for null/undefined repository predicates, and `tinyglobby` for entity/migration patterns. [Official TypeORM 0.3-to-1.0 guide](https://typeorm.io/docs/releases/1.0/upgrading-from-0.3/) The repository's Node declaration should be tightened to the highest dependency floor during the full upgrade; the latest Nest Better Auth integration currently requires Node `>=22.22.1`. [Nest Better Auth 2.7.0 manifest](https://github.com/ThallesP/nestjs-better-auth/blob/v2.7.0/package.json)

### Implementation gate for the latest-version pass

The latest cohort is acceptable only when all of the following pass against PostgreSQL, not merely TypeScript:

1. adapter-level Better Auth 1.7 suites, including `consumeOne`, `incrementOne`, and concurrent racers;
2. schema-generation assertions for `issuer`, `(issuer, accountId)` uniqueness, precise timestamps, indexes, and foreign keys;
3. sign-up, queued verification email, one-time verification, sign-in, session refresh/expiry, and sign-out;
4. clean install/build/type-check/lint/tests with the old 0.8.0 patch absent;
5. a migration rehearsal against both an empty database and a retained-data fixture.

## Latest-version pass implemented on 2026-08-27

The repository now uses the latest stable direct dependency cohort discovered
during this pass. The two deliberate compatibility constraints are:

- Node declarations stay on `@types/node@24.13.3` because the template targets
  the Node 24 LTS runtime rather than the non-LTS Node 26 line;
- the backend uses `ioredis@5.11.1`, the newest release accepted by TypeORM
  1.1's `^5.0.4` peer range. The Bun worker independently uses ioredis 6.

`npm-check-updates --workspaces --root` reports no other direct package behind
its current stable release. pnpm no longer auto-installs unused optional peer
ecosystems such as Prisma from Better Auth. Exact compatible overrides keep the
remaining transitive graph on patched releases; `pnpm audit --prod` reports
zero advisories.

### Breaking changes adapted

| Upgrade                 | Required adaptation                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Better Auth 1.7         | Added `account.issuer`, scoped account uniqueness, a retained-data migration, and atomic adapter `consumeOne`/`incrementOne` support.                                    |
| TypeORM 1.1             | Moved to explicit ESM entities/migrations, a single Nest-managed runtime `DataSource`, named schema metadata, and a `tsx`-driven TypeORM CLI.                            |
| Nest 12                 | Removed the Nest 11-only Better Auth wrapper and `nestjs-zod`; mounted Better Auth's Node handler directly and used Nest's native Standard Schema pipe/interceptor.      |
| Nest 12 ESM             | Marked the backend ESM, added `.js` source specifiers, configured SWC for ESM, and enabled the SWC type-check gate.                                                      |
| TypeScript 7            | Removed `baseUrl`, uses TypeScript 7's native `tsc`, and keeps the official TypeScript 6 compatibility alias for tools that still require the programmatic compiler API. |
| BullMQ 6 / Bun 1.4      | Replaced removed `Job#discard()` with `UnrecoverableError`, declared Redis peers explicitly, and pinned the worker runtime with `.bun-version`.                          |
| Vite 8 / React plugin 6 | Moved route generation into the TanStack Vite plugin plus an explicit CLI gate, and moved React Compiler transforms to `@rolldown/plugin-babel`.                         |
| ESLint 10               | Replaced incompatible React/Vitest plugins, retained strict flat configs, and removed the final Jest-only dependency.                                                    |
| React Email 6           | Replaced removed preview/components package entry points with the React Email 6 package layout.                                                                          |
| pnpm 11 / Turbo 2.10    | Moved project settings and patches into `pnpm-workspace.yaml`, restored isolated dependency boundaries, enabled strict peers, and fixed package-relative task paths.     |

The empty `@repo/types` package and unused web exports/component were removed;
wire types continue to be inferred beside their runtime schemas in
`@repo/contracts` and `@repo/jobs`.

### Adapter 1.1.0 local compatibility patch

The old 0.8.0 patch was deleted because its behavior is upstream. The new,
version-scoped 1.1.0 patch only covers gaps between the latest adapter and
Better Auth 1.7:

- atomic PostgreSQL/CockroachDB, MSSQL, SQLite, and MySQL/MariaDB
  `consumeOne`/`incrementOne` implementations;
- table-level and compound unique index generation, including the required
  `(issuer, accountId)` account identity index;
- missing-index detection when generating migrations for existing tables.

Real PostgreSQL 17 concurrency probes produced one winner for two concurrent
`consumeOne` calls and one winner/final value `1` for guarded `incrementOne`
racers. Fresh and alter-schema probes both emitted the required compound index.

The adapter still does not provide a native TypeORM multi-operation transaction
implementation. Do not enable transaction-dependent Better Auth plugins such
as SCIM until that upstream gap is closed or the patch is extended and tested.

### Validation evidence

- strict frozen install and peer validation: passed;
- full build, TypeScript 7 checks, ESLint, Vitest/Bun tests, and Knip: passed;
- TypeORM v1 codemod dry run: 28 files inspected, zero transforms or parse
  errors;
- PostgreSQL 17 fresh migration, retained credential migration, UTC rollback,
  and external-provider abort rehearsal: passed;
- TypeORM schema drift after migrations: zero queries;
- HTTP validation, BullMQ enqueueing, signup, queued verification, email
  verification, signin, session lookup, signout, and invalidated session:
  passed;
- Bun 1.4.0 unit tests (16/16), bundle, Redis readiness, and graceful shutdown:
  passed.

## Primary sources

- [pnpm settings and catalogs](https://pnpm.io/settings)
- [pnpm installation and Node compatibility](https://pnpm.io/installation)
- [pnpm patch workflow](https://pnpm.io/cli/patch)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [Nest migration guide](https://docs.nestjs.com/migration-guide)
- [Nest OpenAPI introduction](https://docs.nestjs.com/openapi/introduction)
- [Nest Swagger CLI plugin](https://docs.nestjs.com/openapi/cli-plugin)
- [TypeORM 1.0 release](https://typeorm.io/blog/typeorm-1-0/)
- [TypeORM 0.3-to-1.0 guide](https://typeorm.io/docs/releases/1.0/upgrading-from-0.3/)
- [BullMQ 5-to-6 guide](https://docs.bullmq.io/guide/migrations/migrate-from-v5-to-v6)
- [Vite releases and support policy](https://vite.dev/releases)
- [Vite migration guide](https://vite.dev/guide/migration)
- [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
- [TypeScript 7 announcement/migration notes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Better Auth database adapters](https://better-auth.com/docs/adapters/community-adapters)
- [Better Auth direct PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql)
- [Better Auth Expo integration](https://better-auth.com/docs/integrations/expo)
- [oRPC contract-first](https://orpc.dev/docs/contract-first)
- [oRPC Nest integration](https://orpc.dev/docs/openapi/integrations/implement-contract-in-nest)
- [oRPC Expo adapter](https://orpc.dev/docs/adapters/expo)
- [ts-rest contract](https://ts-rest.com/contract/overview)
- [ts-rest React Query v5](https://ts-rest.com/client/react-query-v5)
- [OpenAPI Generator TypeScript Fetch](https://openapi-generator.tech/docs/generators/typescript-fetch/)
- [OpenAPI Generator client list](https://openapi-generator.tech/docs/generators/)
- [tRPC overview and official adapter summary](https://trpc.io/)
- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [Hono Node adapter](https://hono.dev/docs/getting-started/nodejs)
- [React Native networking](https://reactnative.dev/docs/network)
- [TanStack Query React Native compatibility](https://tanstack.com/query/latest/docs/framework/react/installation)
