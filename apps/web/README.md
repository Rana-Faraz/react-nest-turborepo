# Frontend

Minimal Vite React frontend after the reset.

## Current Scope

- Tailwind CSS v4 setup
- shadcn/ui configuration via `components.json`
- `cn()` utility in `src/lib/utils.ts`
- TanStack Router with file-based routes in `src/routes`
- global suspense and error boundary pattern at the router root
- route loaders using `ensureQueryData(...)`
- route components using `useSuspenseQuery(...)`
- no app-specific stores or feature pages yet

## Scripts

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web test
```
