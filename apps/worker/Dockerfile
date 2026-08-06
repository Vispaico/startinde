# StartinDE Worker (BullMQ) — multi-stage, pnpm workspace
# Deploy via Coolify: Public repo → Monorepo → base dir apps/worker

# ---------- deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/knowledge/package.json packages/knowledge/package.json
COPY packages/mail/package.json packages/mail/package.json
COPY packages/notifications/package.json packages/notifications/package.json
RUN corepack enable && pnpm install --frozen-lockfile

# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm exec nx build worker --skip-nx-cache

# ---------- deploy (prod-only, workspace-linked) ----------
FROM node:22-alpine AS deployer
WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/packages ./packages
RUN corepack enable \
    && pnpm deploy --legacy --filter @startinde/worker --prod /out/worker

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deployer /out/worker ./
CMD ["node", "dist/main.js"]
