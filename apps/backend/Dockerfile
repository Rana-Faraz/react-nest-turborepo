# Prune stage
FROM node:24-bookworm-slim AS pruner

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY . .
RUN pnpm exec turbo prune backend --docker

# Build stage
FROM node:24-bookworm-slim AS installer

# Create app directory
WORKDIR /app

# Copy package files
COPY --from=pruner /app/out/json .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/turbo.json ./turbo.json
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN pnpm install --frozen-lockfile

FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full .
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN pnpm --filter backend... build

# Production stage
FROM node:24-bookworm-slim AS runner

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/ .

CMD ["node", "apps/backend/dist/main.js"]

# Expose application port
EXPOSE 3000
