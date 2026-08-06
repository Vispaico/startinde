# StartinDE API (NestJS) — multi-stage, pnpm workspace
# Deploy via Coolify: Public repo → Monorepo → base dir apps/api

# ---------- deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/rules/package.json packages/rules/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/mail/package.json packages/mail/package.json
RUN corepack enable && pnpm install --frozen-lockfile

# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm exec nx build api --skip-nx-cache

# ---------- deploy (prod-only, workspace-linked) ----------
FROM node:22-alpine AS deployer
WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages ./packages
RUN corepack enable \
    && pnpm deploy --legacy --filter @startinde/api --prod /out/api

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deployer /out/api ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
