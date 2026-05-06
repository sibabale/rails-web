import { defineConfig, devices } from '@playwright/test';
import { E2E_APP_ORIGIN, E2E_APP_PORT, MOCK_API_ORIGIN } from './e2e/constants';

const baseURL = E2E_APP_ORIGIN;

/**
 * E2E runs against `next dev` with public env vars pointing API traffic at
 * `MOCK_API_ORIGIN`. Tests install route handlers on that origin (see `e2e/fixtures.ts`).
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120_000,
    // Reusing an already-running dev server would ignore the env below (wrong for E2E).
    // Set PLAYWRIGHT_REUSE_DEV_SERVER=1 only if your running server already matches these vars.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_DEV_SERVER === '1',
    env: {
      PATH: process.env.PATH ?? '',
      HOME: process.env.HOME ?? '',
      USER: process.env.USER ?? '',
      TMPDIR: process.env.TMPDIR ?? '',
      LANG: process.env.LANG ?? '',
      SystemRoot: process.env.SystemRoot ?? '',
      PATHEXT: process.env.PATHEXT ?? '',
      PORT: E2E_APP_PORT,
      NODE_ENV: 'development',
      NEXT_PUBLIC_SITE_URL: baseURL,
      NEXT_PUBLIC_CLIENT_SERVER: MOCK_API_ORIGIN,
      NEXT_PUBLIC_ENABLE_AUTH_VIEWS: 'true',
      NEXT_PUBLIC_SHOW_AUTH_BUTTONS: 'true',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
      NEXT_PUBLIC_DOCS_URL: `${baseURL}/docs`,
    },
  },
});
