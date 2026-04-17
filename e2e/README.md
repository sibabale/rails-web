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

Interactive UI:

```bash
npm run test:e2e:ui
```

## Configuration

- `playwright.config.ts` — `webServer` (`npm run dev`), `baseURL`, and E2E-only `NEXT_PUBLIC_*` vars. Client env reads use static `process.env.*` keys in `lib/env.ts` so Turbopack can inline them.
- `e2e/constants.ts` — mock gateway origin (must match `NEXT_PUBLIC_CLIENT_SERVER` in config).

## Cursor Playwright MCP

You can use the Playwright MCP against a running dev server (`npm run dev`) to explore flows manually; this folder is the source of truth for **repeatable** automated coverage (`npm run test:e2e`).

## Against real services

To hit a real `rails-client-server`, drop the mock route in a dedicated project or override `NEXT_PUBLIC_CLIENT_SERVER` and remove `installApiMocksOnContext` from `fixtures.ts` for that project only.
