/**
 * Live registration-only E2E — new business against real BFF + enterprise.
 * Stops after register + empty integrations page (no DB connect).
 *
 * Run: npm run test:e2e:registration:live
 */
import { test, expect } from '@playwright/test';
import {
  hasLiveDatabaseUrls,
  openIntegrations,
  registerFreshUser,
  siteOrigin,
} from './live-journey-shared';
import {
  attachApiTimeline,
  logTimelineStep,
  startLiveTimeline,
  LIVE_JOURNEY_TIMELINE_LOG,
} from './live-journey-timeline';

const BFF_ORIGIN = process.env.LIVE_BFF_URL ?? 'http://127.0.0.1:3100';
const LIST_LOAD_TIMEOUT_MS = 30_000;

test.use({
  video: 'on',
  trace: 'on',
});

test.describe('BYOD registration (live stack)', () => {
  test.beforeAll(() => {
    startLiveTimeline();
    console.log(`[live-registration] Timeline: ${LIVE_JOURNEY_TIMELINE_LOG}`);
    console.log(`[live-registration] Site: ${siteOrigin}`);
  });

  test('registers new business and shows empty database integrations', async ({ page }) => {
    test.skip(
      !hasLiveDatabaseUrls(),
      'Set LIVE_DB_* URLs in rails-enterprise/.env (see scripts/run-live-registration.sh)',
    );

    attachApiTimeline(page, BFF_ORIGIN);

    let email = '';

    await test.step('Register fresh business + admin', async () => {
      logTimelineStep('registration_start');
      const user = await registerFreshUser(page);
      email = user.email;
      logTimelineStep('registration_done', email);
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 120_000 });
    });

    await test.step('Integrations page loads with four disconnected services', async () => {
      logTimelineStep('integrations_navigate');
      await openIntegrations(page);

      await expect(page.getByTestId('database-connection-skeleton-accounts')).toHaveCount(0, {
        timeout: LIST_LOAD_TIMEOUT_MS,
      });

      await expect(page.getByRole('button', { name: /^Connect$/i })).toHaveCount(4, {
        timeout: LIST_LOAD_TIMEOUT_MS,
      });
      await expect(page.getByText('Connected', { exact: true })).toHaveCount(0);
      await expect(page.getByText(/database schema updates are ready to apply/i)).toHaveCount(0);

      logTimelineStep('integrations_ready', '4 connect forms, 0 connected, no apply banner');
    });

    console.log(`[live-registration] Success — ${email}`);
  });
});
