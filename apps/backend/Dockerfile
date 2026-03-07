# Prune stage
FROM node:20-bullseye AS pruner

WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=backend --docker

# Build stage
FROM node:20-bullseye AS installer

# Create app directory
WORKDIR /app

# Copy package files
COPY --from=pruner /app/out/json .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/turbo.json ./turbo.json
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM node:20-bullseye AS builder

WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full .
RUN npm install -g pnpm
RUN pnpm run build

# Production stage
FROM node:20-bullseye AS runner

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/ .

CMD ["node", "apps/backend/dist/main.js"]

# Expose application port
EXPOSE 3000
