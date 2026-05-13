# Goods tracking monorepo

Multitenant goods tracking with PostgreSQL, RBAC, **Hono API**, **Next.js web** (MUI shell styled like BillingWeb, no sidebar), and **Expo** mobile.

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io) 9+
- Docker (optional, for local Postgres)

## Quick start

1. Copy [`.env.example`](.env.example) to `.env` in the repo root and to `apps/api` / `apps/web` as needed (or export variables in your shell).

2. Start Postgres:

   ```bash
   docker compose up -d postgres
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Migrate and seed permissions:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. Run API and web (separate terminals):

   ```bash
   pnpm --filter @repo/api dev
   pnpm --filter @repo/web dev
   ```

6. Open http://localhost:3000 — register a tenant + user, then use the **Tenant** selector and top tabs (visibility follows RBAC).

7. Mobile (Expo):

   ```bash
   pnpm --filter @repo/mobile dev
   ```

   Set `EXPO_PUBLIC_API_URL` to your machine’s LAN IP if testing on a device.

## Workspace layout

| Path | Role |
|------|------|
| [`apps/api`](apps/api) | Hono HTTP API, JWT auth, `X-Tenant-Id`, Drizzle + RLS transactions |
| [`apps/web`](apps/web) | Next.js App Router, MUI theme aligned with BillingWeb, horizontal nav |
| [`apps/mobile`](apps/mobile) | Expo + SecureStore + sample login / goods count |
| [`packages/db`](packages/db) | Drizzle schema, shared audit columns, SQL migrations + RLS |
| [`packages/contracts`](packages/contracts) | Zod DTOs + permission / nav constants |

## CI

[`/.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `pnpm install` and `pnpm turbo run build typecheck lint`.

## Notes

- **RLS** is enabled on `goods_items`, `stock_locations`, and `stock_movements`. The API sets `app.tenant_id` inside a transaction for those queries.
- **Register** requires permissions to be seeded first (`pnpm db:seed`).
- Web auth uses **httpOnly** cookies via same-origin `/api/auth/*` route handlers that proxy to the API.
