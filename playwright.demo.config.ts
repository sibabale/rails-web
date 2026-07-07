/**
 * Demo config for RAI-65 walkthrough — mock API, headed browser, slow motion.
 * Usage: npx playwright test --config=playwright.demo.config.ts
 */
import { defineConfig, devices } from '@playwright/test';
import { E2E_APP_ORIGIN, E2E_APP_PORT, MOCK_API_ORIGIN } from './e2e/constants';

const slowMo = Number(process.env.DEMO_SLOW_MO ?? 900);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: E2E_APP_ORIGIN,
    headless: false,
    viewport: { width: 1440, height: 900 },
    launchOptions: { slowMo },
    video: 'on',
    trace: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: E2E_APP_ORIGIN,
    timeout: 120_000,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_DEV_SERVER === '1',
    env: {
      PATH: process.env.PATH ?? '',
      HOME: process.env.HOME ?? '',
      USER: process.env.USER ?? '',
      TMPDIR: process.env.TMPDIR ?? '',
      LANG: process.env.LANG ?? '',
      PORT: E2E_APP_PORT,
      NODE_ENV: 'development',
      NEXT_PUBLIC_SITE_URL: E2E_APP_ORIGIN,
      NEXT_PUBLIC_CLIENT_SERVER: MOCK_API_ORIGIN,
      NEXT_PUBLIC_ENABLE_AUTH_VIEWS: 'true',
      NEXT_PUBLIC_SHOW_AUTH_BUTTONS: 'true',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
    },
  },
});
