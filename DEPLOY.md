# Coolify Deployment — Environment Variables per app

Coolify has a **separate Environment Variables editor per resource**. These are
the values each of the 4 apps needs. Common/shared values (DB, SMTP, secrets)
are repeated where required. Inside Coolify's network use the **internal
hostnames** of the DB resources (e.g. `postgres`, `redis`, `qdrant`) — NOT
`localhost`.

Replace `***` and `example.com` with your real values.

---

## api  (`apps/api/Dockerfile`)
| Var | Value |
|---|---|
| `DATABASE_URL` | `postgres://startinde:***@postgres:5432/startinde` |
| `REDIS_URL` | `redis://redis:6379` |
| `QDRANT_URL` | `http://qdrant:6333` |
| `LITELLM_BASE_URL` | `http://<your-server>:4000` (or LiteLLM container) |
| `LITELLM_API_KEY` | the app-scoped virtual key |
| `CHAT_MODEL` | primary model id (e.g. `anthropic/claude-sonnet-4.5`) |
| `EMBEDDING_MODEL` | `BAAI/bge-m3` (multilingual) |
| `SEARXNG_URL` | `https://search.vispaico.com` |
| `FIRECRAWL_URL` | `http://<your-server>:3002` (Firecrawl Simple) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | your Hostinger SMTP |
| `SESSION_SECRET` | long random string |
| `ADMIN_EMAILS` | `admin1@example.com,admin2@example.com` |
| `NEXT_PUBLIC_APP_URL` | `https://startin-de.com` |
| `API_URL` | `https://api.startin-de.com` |
| `PORT` | `3000` |

## web  (`apps/web/Dockerfile`)
| Var | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.startin-de.com` |
| `NEXT_PUBLIC_APP_URL` | `https://startin-de.com` |
| `PORT` | `3000` |

## admin  (`apps/admin/Dockerfile`)
| Var | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.startin-de.com` |
| `NEXT_PUBLIC_APP_URL` | `https://admin.startin-de.com` |
| `PORT` | `3000` |

## worker  (`apps/worker/Dockerfile`) — no port/domain
| Var | Value |
|---|---|
| `DATABASE_URL` | `postgres://startinde:***@postgres:5432/startinde` |
| `REDIS_URL` | `redis://redis:6379` |
| `QDRANT_URL` | `http://qdrant:6333` |
| `LITELLM_BASE_URL` / `LITELLM_API_KEY` / `CHAT_MODEL` / `EMBEDDING_MODEL` | same as api |
| `SEARXNG_URL` / `FIRECRAWL_URL` | your server services |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Hostinger |
| `ADMIN_EMAILS` | same as api (only needed if worker needs to know roles; safe to include) |

---

## Notes
- `ADMIN_EMAILS` is read by the **api** at sign-in: any account whose email is
  in the comma-separated list gets the `admin` role automatically — no DB edit.
  Keep both admin emails in the api (and optionally worker) resources.
- `SESSION_SECRET` must match across api (and web/admin if they verify tokens —
  currently only api does). Use one shared value.
- The Postgres/Redis/Qdrant internal hostnames are whatever you named the
  resources in Coolify (commonly `postgres`, `redis`, `qdrant`).
