/**
 * Live E2E: new company registration + connect all four real DB strings.
 * No login/logout/edit — isolate the first-time integration flow.
 *
 * Run: npm run test:e2e:registration-connect:live
 */
import { test, expect } from '@playwright/test';
import {
  BYOD_JOURNEY_LIVE_BUG_LOG,
  clearJourneyBugLogAt,
  expectOrLogAt,
  logJourneyBugAt,
} from './journey-bug-log';
import {
  card,
  DATABASE_CARDS,
  dbUrls,
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
const CONNECT_TIMEOUT_MS = 180_000;
const USERS_SOFT_FAIL_TIMEOUT_MS = 30_000;

/**
 * Users BYOD often collides with platform DATABASE_URL in dev — log and continue other services.
 * Auto-disabled when BYOD_USERS_DATABASE_URL is loaded from .env.local (see playwright.live.config.ts).
 */
const USERS_SOFT_FAIL =
  process.env.LIVE_USERS_CONNECT_SOFT_FAIL !== '0' &&
  process.env.LIVE_BYOD_USERS_CONFIGURED !== '1';

test.use({
  video: 'on',
  trace: 'on',
});

test.describe('BYOD registration + connect (live stack)', () => {
  test.beforeAll(() => {
    startLiveTimeline();
    clearJourneyBugLogAt(BYOD_JOURNEY_LIVE_BUG_LOG);
    console.log(`[live-reg-connect] Timeline: ${LIVE_JOURNEY_TIMELINE_LOG}`);
    console.log(`[live-reg-connect] Bug log: ${BYOD_JOURNEY_LIVE_BUG_LOG}`);
    console.log(`[live-reg-connect] Site: ${siteOrigin}`);
  });

  test('register new company and connect all database strings', async ({ page }) => {
    test.skip(
      !hasLiveDatabaseUrls(),
      'Set LIVE_DB_* URLs in rails-enterprise/.env (see scripts/run-live-registration-connect.sh)',
    );

    attachApiTimeline(page, BFF_ORIGIN);

    let email = '';
    const connectResults: Record<string, boolean> = {};

    await test.step('Register fresh business + admin', async () => {
      logTimelineStep('registration_start');
      const user = await registerFreshUser(page);
      email = user.email;
      logTimelineStep('registration_done', email);
    });

    await test.step('Empty integrations — four Connect forms', async () => {
      logTimelineStep('integrations_navigate');
      await openIntegrations(page);

      await expect(page.getByTestId('database-connection-skeleton-accounts')).toHaveCount(0, {
        timeout: LIST_LOAD_TIMEOUT_MS,
      });
      await expect(page.getByRole('button', { name: /^Connect$/i })).toHaveCount(4, {
        timeout: LIST_LOAD_TIMEOUT_MS,
      });
      await expect(page.getByText('Connected', { exact: true })).toHaveCount(0);
      logTimelineStep('integrations_empty');
    });

    await test.step('Connect all four databases with real connection strings', async () => {
      logTimelineStep('connect_all_start');
      for (const { key, title } of DATABASE_CARDS) {
        const url = dbUrls[key];
        const section = card(page, title);
        const connectStartedAt = Date.now();

        logTimelineStep(`connect_fill_${key}`);
        await section.getByRole('textbox', { name: new RegExp(`${title} connection`, 'i') }).fill(url);
        await section.getByRole('button', { name: /^Connect$/i }).click();

        await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, `setup-progress-${key}`, async () => {
          await expect(section.getByTestId('database-connection-setup-progress')).toBeVisible({
            timeout: 15_000,
          });
        });

        const softFailUsers = USERS_SOFT_FAIL && key === 'users';
        let connected = false;

        if (softFailUsers) {
          connected = await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, `connect-${key}`, async () => {
            await expect(section.getByText('Connected', { exact: true })).toBeVisible({
              timeout: USERS_SOFT_FAIL_TIMEOUT_MS,
            });
          });
          if (!connected) {
            logJourneyBugAt(
              BYOD_JOURNEY_LIVE_BUG_LOG,
              `connect-skipped-${key}`,
              'Users connect failed or timed out — continuing with ledger and audit (RAI-49 platform DB guard / separate BYOD DB required)',
            );
          }
        } else {
          await expect(section.getByText('Connected', { exact: true })).toBeVisible({
            timeout: CONNECT_TIMEOUT_MS,
          });
          connected = true;
        }

        connectResults[key] = connected;
        const durationMs = Date.now() - connectStartedAt;
        logTimelineStep(`connect_done_${key}`, `${title} ${connected ? 'ok' : 'failed'} ${durationMs}ms`);
      }
    });

    await test.step('Connected cards — soft Users failure allowed; others must connect', async () => {
      const requiredConnected = DATABASE_CARDS.filter(({ key }) => key !== 'users' || !USERS_SOFT_FAIL);
      for (const { key, title } of requiredConnected) {
        if (connectResults[key] === false) {
          throw new Error(`${title} failed to connect — see ${BYOD_JOURNEY_LIVE_BUG_LOG}`);
        }
      }

      const expectedConnectedCount = Object.values(connectResults).filter(Boolean).length;
      await expect(page.getByText('Connected', { exact: true })).toHaveCount(expectedConnectedCount, {
        timeout: 10_000,
      });

      const applyBanner = page.getByText(/database schema updates are ready to apply/i);
      const bannerVisible = await applyBanner.isVisible().catch(() => false);
      if (bannerVisible) {
        logJourneyBugAt(
          BYOD_JOURNEY_LIVE_BUG_LOG,
          'apply-banner-after-fresh-connect',
          'Fresh registration should not show pending migrations after inline connect setup',
        );
      } else {
        logTimelineStep('no_apply_banner', 'migrations applied during connect');
      }
    });

    await test.step('Overview milestone — Connect Databases complete when all required services connected', async () => {
      if (USERS_SOFT_FAIL && connectResults.users === false) {
        logTimelineStep('milestone_skipped', 'users not connected — milestone check skipped');
        console.log(`[live-reg-connect] Partial success — ${email} (users skipped)`);
        return;
      }

      await page.goto(`${siteOrigin}/dashboard`);
      await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible({
        timeout: 30_000,
      });
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'milestone-connected', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toBeVisible({
          timeout: 30_000,
        });
      });
      logTimelineStep('milestone_check_done');
      console.log(`[live-reg-connect] Success — ${email}`);
    });
  });
});
