/**
 * Fake gateway origin used only in E2E. The dev server is configured with
 * NEXT_PUBLIC_CLIENT_SERVER pointing here; Playwright intercepts all requests
 * to this host (no real rails-client-server process required).
 */
export const MOCK_API_ORIGIN = 'http://127.0.0.1:4100';

/** Must match `playwright.config.ts` webServer / `use.baseURL` (used for session cookies). */
export const E2E_APP_HOST = '127.0.0.1';
/** Default 4000 avoids clashing with a local app on 3000. Override: `PLAYWRIGHT_E2E_PORT=3005 npm run test:e2e`. */
export const E2E_APP_PORT = process.env.PLAYWRIGHT_E2E_PORT ?? '4000';
export const E2E_APP_ORIGIN = `http://${E2E_APP_HOST}:${E2E_APP_PORT}`;
