# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules

COPY . .

RUN pnpm --filter @trendvault/api exec prisma generate
RUN pnpm turbo build --filter=@trendvault/api

# Stage 3: Runner
FROM node:22-alpine AS runner
RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001 -G appuser
WORKDIR /app

COPY --from=builder --chown=appuser:appuser /app/apps/api/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/apps/api/prisma ./prisma
COPY --from=builder --chown=appuser:appuser /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/apps/api/package.json ./package.json

USER appuser
EXPOSE 3001

CMD ["node", "dist/server.js"]
