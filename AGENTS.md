# AGENTS.md — StartinDE

## Project Overview

StartinDE is a **multilingual Germany immigration, study, work, and relocation platform**.
Four connected products: public information platform, AI Germany advisor, personal
application dashboard, paid services marketplace. Domain: `startin-de.com`.

**Not a blog.** A guided application and relocation system.

## Architecture

### Monorepo (Nx + pnpm workspaces)

```
startinde/
├── apps/
│   ├── web/        # Next.js 16 (public site + customer dashboard) — port 3000
│   ├── api/        # NestJS 11 (auth, assessment, admin endpoints) — port 3000
│   ├── worker/     # BullMQ workers (knowledge ingestion, notifications, docs)
│   └── admin/      # Next.js 16 (internal ops console) — port 3000
├── packages/
│   ├── database/   # Drizzle schema + pg Pool (Postgres, relational-only)
│   ├── auth/       # jose JWT + magic-link token helpers
│   ├── ai/         # LiteLLM client + 7 AI service input/output schemas
│   ├── rules/      # Deterministic rules engine (4-status RuleResult)
│   ├── knowledge/  # SearXNG discovery, diff detection, change classification
│   ├── documents/  # Upload types, readiness report builder
│   ├── mail/       # nodemailer SMTP (Hostinger) + HTML wrappers
│   ├── notifications/ # Relevance filter ("Updates for Me")
│   ├── payments/   # Stripe service ladder + price formatting
│   ├── localization/ # en + vi dictionaries (typed)
│   └── ui/         # Brand design tokens (ink/gold, Inter, Newsreader)
├── docker-compose.yml   # Dev: Postgres 16 + Redis 7 + Qdrant
└── DEPLOY.md            # Coolify per-app env variable reference
```

### Search/Vector Layer

- **Qdrant** = the single search and vector layer. Separate collections per domain:
  legislation, official guidance, university info, user documents, service content.
- **PageIndex** = indexing pipeline (ingest → chunk → embed → upsert to Qdrant).
- Full-text search via **Qdrant payload filters + chunk text**. No pgvector, no
  dedicated FTS engine.

### External Services (self-hosted on your server)

- **LiteLLM** — OpenAI-compatible LLM gateway (model routing, no vendor lock-in)
- **Firecrawl Simple** — self-hosted, no API key, `/v1/scrape` + `/v1/crawl` only
- **SearXNG** — JSON API `/search?q=...&format=json`, no key; discovery tool only
- **Postgres** + **Redis** — relational data + BullMQ queues

## Tech Stack

| Layer | Technology |
|---|---|
| Web apps | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend API | NestJS 11, TypeScript, Auth.js patterns, Swagger-compatible |
| Workers | BullMQ 6 + ioredis 6 (knowledge ingestion, notifications, docs) |
| Database | PostgreSQL 16 + Drizzle ORM (relational-only, no pgvector) |
| Search/vector | Qdrant (single layer) via PageIndex indexing pipeline |
| LLM | LiteLLM (self-hosted) — all AI services call through the gateway |
| Scraping | Firecrawl Simple (self-hosted) — custom diff detection on top |
| Discovery | SearXNG (self-hosted) — feeds knowledge ingestion, not answer source |
| Email | nodemailer via Hostinger SMTP (configured in .env) |
| Auth | Email magic-link + JWT (jose) — Google OAuth deferred |
| Payments | Stripe (the one external SaaS dependency) |
| Deploy | Coolify — Dockerfile build pack, per-app resources |
| Package manager | pnpm 11.20.0 (`packageManager` field in root package.json) |

## Commands

```bash
# Install dependencies
pnpm install

# Run one app
npx nx dev web          # Next.js dev server (port 3000)
npx nx dev admin        # Admin dev server (port 3000)
npx nx serve api        # NestJS API (port 3000)
npx nx serve worker     # BullMQ worker

# Build one or all
npx nx build web
npx nx run-many -t build

# Typecheck one or all
npx nx typecheck api
npx nx run-many -t typecheck

# Test
npx nx test worker      # vitest suite (knowledge processor diff/classification)

# Sync workspace (register new nx:run-script targets)
npx nx sync

# Database
cd packages/database
pnpm db:generate        # generate Drizzle migration SQL
pnpm db:push            # push schema to connected DB (dev only)
pnpm db:studio          # Drizzle Studio
```

All builds use `CI=true` in Docker (required for `output: 'standalone'` — avoids
pnpm TTY purge abort).

## Code Conventions

### TypeScript

- Strict mode enabled. Never use `any` as a passthrough — `unknown` + type narrowing.
- All relative imports in ESM packages use explicit `.js` extensions.
- Types shared across apps live in the appropriate `packages/*` lib, not in app code.

### Backend (NestJS)

- POST endpoints return HTTP 200 (not NestJS default 201). Use `@HttpCode(HttpStatus.OK)`.
- Admin routes require staff/expert/admin role via session JWT — never skip the guard.
- Auth reads `ADMIN_EMAILS` env at sign-in to auto-promote matching accounts.
- No direct legal decisions in AI services — rules engine evaluates; AI explains.

### Frontend (Next.js)

- All app routes are SSR-compatible. Client components use `'use client'` only when
  they access `sessionStorage`, `useSearchParams`, or browser-only APIs.
- `'use client'` pages with searchParams wrap in `<Suspense>` boundary.
- Session stored in `sessionStorage` (JWT string). No localStorage, no cookies for now.
- Assessment flow uses `sessionStorage` to pass result to `/results` page.

### Knowledge Engine

- SearXNG = discovery only, never answer source for legal content.
- Firecrawl Simple = page fetching for diff detection.
- AI answers = RAG-only from approved knowledge records + enforced citations.
- Legal/procedural answers always show: source, lastVerified, confidence, disclaimer.

### Rules Engine

- Returns `RuleResult` with 4 statuses: `met` | `not_met` | `unknown` | `review_required`.
- **Never** a simple yes/no visa verdict.
- Rules are versioned, machine-readable, stored in Postgres.

### Database

- Postgres for relational data only — all vector/search lives in Qdrant.
- User documents are isolated; never mixed into the shared knowledge Qdrant collections.
- Every legal/procedural claim has: `source_url`, `last_verified_at`, `effective_from`.
- First Drizzle migration: `packages/database/drizzle/0000_sparkling_terrax.sql`.

### Environment Variables

- Never commit `.env`. Only `.env.example` is tracked.
- Per-app env vars documented in `DEPLOY.md`.
- `SESSION_SECRET` must be identical across api, web, and admin resources.
- Postgres/Redis/Qdrant use Coolify internal hostnames, not `localhost`.

## Deployment (Coolify)

### Per-app setup (monorepo — 4 resources, NOT 1)

| Setting | All 4 apps |
|---|---|
| Repository | `https://github.com/Vispaico/startinde` |
| Build Pack | **Dockerfile** (not Nixpacks) |
| Base Directory | `/` (repo root — critical!) |
| Dockerfile Location | `apps/web/Dockerfile`, `apps/api/Dockerfile`, etc. |
| Port | 3000 (from EXPOSE in Dockerfile) |

**If Base Directory is not `/`, the Dockerfile's `COPY package.json` will fail**
because it copies repo-root files into the builder stage.

### Databases (create manually in Coolify)

- PostgreSQL (native) — hostname typically `postgres`
- Redis (native) — hostname typically `redis`
- Qdrant (Docker Image: `qdrant/qdrant:latest`, ports 6333/6334)

### Deployment order

1. Deploy **api** first → run migrations (`pnpm db:push` or `pnpm db:generate` + SQL)
2. Deploy **web** + **admin** (no DB dependency)
3. Deploy **worker** (needs Postgres + Redis up)

### Admin access

Set `ADMIN_EMAILS=admin1@example.com,admin2@example.com` in the **api** env.
Accounts whose email is in the list automatically get the `admin` role at sign-in —
no DB edit needed. Same env var can be set on the worker for consistency.

## AGENTS.md Rules

## Must Observe Rules

- Do not preserve backward compatibility.
- Choose the simplest implementation that fully meets the current requirements.
- Prefer established, well-maintained libraries over custom implementations.
- Avoid premature abstraction: prefer simple concrete solutions until real patterns emerge.
- Prefer composition over centralization: use small focused modules with explicit interfaces instead of centralized systems.
- Keep responsibilities clear: keep modules focused and avoid mixing transport, orchestration, domain/workflow state, persistence, infrastructure.
- Never skip verification: do not bypass required checks, tests, or quality gates.

## NVIDIA API Rate Limiting Rule

When using NVIDIA API models:

- Limit requests to maximum 36 per minute
- Wait 1.7 seconds between requests (60/36 = ~1.67s)
- If you receive a 429 error, wait 5 seconds before retrying
- Log all rate limit waits to the console

This ensures continuous usage without hitting the 40 RPM limit.
