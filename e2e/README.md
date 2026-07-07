# End-to-end tests (Playwright)

These tests drive the real Next.js app (`next dev`) and **mock** all `rails-client-server` traffic at `http://127.0.0.1:4100` via Playwright routing (see `mock-api.ts` and `fixtures.ts`). You do not need the Rust gateway running locally for the default suite.

## Run

From `src/rails-web`:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

The app under test listens on **4000** by default (`http://127.0.0.1:4000`) so it does not collide with a normal `npm run dev` on 3000. To use another port: `PLAYWRIGHT_E2E_PORT=3005 npm run test:e2e`.

Exploratory UX flow audit (investigation + interaction sweep + bug log):

```bash
npm run test:e2e:audit
```

This writes:
- `e2e/artifacts/ui-flow-inventory.json`
- `e2e/artifacts/ui-flow-audit-bugs.jsonl`

Chaos flow stress test (race clicks, delayed requests, weird inputs, rapid navigation):

```bash
npm run test:e2e:chaos
```

This writes:
- `e2e/artifacts/ui-flow-chaos-bugs.jsonl`

Interactive UI:

```bash
npm run test:e2e:ui
```

Merged BYOD journey (register → connect → login → edit) in **headed** realtime browser:

```bash
npm run test:e2e:journey
```

Mock-only — fast, no BFF/enterprise. Soft failures → `e2e/artifacts/byod-journey-bugs.jsonl`.

### True E2E (live stack)

Real `rails-web` → `rails-client-server` → `rails-enterprise`, real Postgres URLs, new business registration:

```bash
# Terminal 1 — enterprise gateway
cd ../rails-enterprise && make dev

# Terminal 2 — headed live journey (starts BFF + web if needed)
cd rails-web && npm run test:e2e:journey:live
```

Requires database URLs in `rails-enterprise/.env` or `.env.local`. Soft failures → `e2e/artifacts/byod-journey-live-bugs.jsonl`. Videos under `recordings-output/` (gitignored).

### Live database URL precedence

Live scripts (`scripts/run-live-*.sh`) and `playwright.live.config.ts` load env in this order:

1. `rails-enterprise/.env` — platform/service `USERS_DATABASE_URL`, `ACCOUNTS_DATABASE_URL`, `LEDGER_DATABASE_URL`, `AUDIT_DATABASE_URL`
2. `rails-enterprise/.env.local` — **wins over `.env`** for the same logical service

Use **`BYOD_*_DATABASE_URL`** keys in `.env.local` when you have a separate Neon branch for E2E (recommended for Users after RAI-49):

| `.env.local` key | Fallback in `.env` | Playwright env var |
| --- | --- | --- |
| `BYOD_USERS_DATABASE_URL` | `USERS_DATABASE_URL` | `LIVE_DB_USERS_URL` |
| `BYOD_ACCOUNTS_DATABASE_URL` | `ACCOUNTS_DATABASE_URL` | `LIVE_DB_ACCOUNTS_URL` |
| `BYOD_LEDGER_DATABASE_URL` | `LEDGER_DATABASE_URL` | `LIVE_DB_LEDGER_URL` |
| `BYOD_AUDIT_DATABASE_URL` | `AUDIT_DATABASE_URL` | `LIVE_DB_AUDIT_URL` |

When `BYOD_USERS_DATABASE_URL` is set, live registration-connect specs **hard-fail** Users connect (soft-fail disabled). To force soft-fail anyway (platform DB collision debugging): `LIVE_USERS_CONNECT_SOFT_FAIL=1`.

## Configuration

- `playwright.config.ts` — `webServer` (`npm run dev`), `baseURL`, and E2E-only `NEXT_PUBLIC_*` vars. Client env reads use static `process.env.*` keys in `lib/env.ts` so Turbopack can inline them.
- `e2e/constants.ts` — mock gateway origin (must match `NEXT_PUBLIC_CLIENT_SERVER` in config).

## Cursor Playwright MCP

You can use the Playwright MCP against a running dev server (`npm run dev`) to explore flows manually; this folder is the source of truth for **repeatable** automated coverage (`npm run test:e2e`).

## Against real services

To hit a real `rails-client-server`, drop the mock route in a dedicated project or override `NEXT_PUBLIC_CLIENT_SERVER` and remove `installApiMocksOnContext` from `fixtures.ts` for that project only.
