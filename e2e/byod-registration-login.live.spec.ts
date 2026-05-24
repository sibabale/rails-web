/**
 * Live E2E — registration → connect → apply → overview milestone → login restore.
 * RAI-51 / RAI-55: real stack, no mocks.
 *
 * Soft failures → e2e/artifacts/byod-registration-login-live-bugs.jsonl
 * Run: npm run test:e2e:registration-login:live
 */
import { test, expect } from '@playwright/test';
import {
  BYOD_REGISTRATION_LOGIN_LIVE_BUG_LOG,
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
  signInUser,
  siteOrigin,
} from './live-journey-shared';
import { attachApiTimeline, logTimelineStep, startLiveTimeline } from './live-journey-timeline';

const BFF_ORIGIN = process.env.LIVE_BFF_URL ?? 'http://127.0.0.1:3100';
const BUG_LOG = BYOD_REGISTRATION_LOGIN_LIVE_BUG_LOG;
const CONNECT_TIMEOUT_MS = 180_000;
const APPLY_TIMEOUT_MS = 180_000;

test.describe.configure({ mode: 'serial' });

test.describe('BYOD registration + login restore (live)', () => {
  test.beforeAll(() => {
    startLiveTimeline();
    clearJourneyBugLogAt(BUG_LOG);
    console.log(`[live-reg-login] Bug log: ${BUG_LOG}`);
    console.log(`[live-reg-login] Site: ${siteOrigin}`);
  });

  test.afterAll(() => {
    console.log(`[live-reg-login] Review bugs: ${BUG_LOG}`);
  });

  test('register, connect four DBs, apply migrations, login restore', async ({ page }) => {
    test.skip(!hasLiveDatabaseUrls(), 'Set LIVE_DB_* in rails-enterprise/.env');
    test.setTimeout(600_000);

    attachApiTimeline(page, BFF_ORIGIN);

    const credentials = await test.step('Register fresh business (real BFF)', async () => {
      logTimelineStep('register_start');
      const creds = await registerFreshUser(page);
      logTimelineStep('register_done', creds.email);
      return creds;
    });

    await test.step('Connect all four databases', async () => {
      await openIntegrations(page);
      for (const { key, title } of DATABASE_CARDS) {
        const section = card(page, title);
        await section
          .getByRole('textbox', { name: new RegExp(`${title} connection`, 'i') })
          .fill(dbUrls[key]);
        await section.getByRole('button', { name: /^Connect$/i }).click();

        const connected = await expectOrLogAt(BUG_LOG, `connect-${key}`, async () => {
          await expect(section.getByText('Connected', { exact: true })).toBeVisible({
            timeout: CONNECT_TIMEOUT_MS,
          });
        });
        if (!connected) {
          throw new Error(`${title} failed to connect — see ${BUG_LOG}`);
        }
        logTimelineStep(`connected_${key}`);
      }
    });

    await test.step('Overview Step 1 incomplete before apply (RAI-51)', async () => {
      await page.goto(`${siteOrigin}/dashboard`);
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLogAt(BUG_LOG, 'milestone-incomplete-before-apply', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toHaveCount(0);
        await expect(connectStep.getByText('Configure Integrations')).toBeVisible({
          timeout: 30_000,
        });
      });
      await openIntegrations(page);
    });

    await test.step('Apply database schema updates', async () => {
      const banner = page.getByText(/database schema updates are ready to apply/i);
      const bannerVisible = await banner.isVisible().catch(() => false);
      if (!bannerVisible) {
        logJourneyBugAt(
          BUG_LOG,
          'apply-banner-missing',
          'No apply banner after connect — migrations may have run during connect; checking milestone next',
        );
        return;
      }

      await page.getByRole('button', { name: /Apply updates/i }).click();
      const applied = await expectOrLogAt(BUG_LOG, 'apply-success', async () => {
        await expect(page.getByText(/applied successfully|already up to date/i)).toBeVisible({
          timeout: APPLY_TIMEOUT_MS,
        });
      });
      if (applied) {
        logTimelineStep('migrations_applied');
      }
    });

    await test.step('Overview Step 1 complete after apply', async () => {
      await page.goto(`${siteOrigin}/dashboard`);
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLogAt(BUG_LOG, 'milestone-connected-after-apply', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toBeVisible({
          timeout: 60_000,
        });
      });
    });

    await test.step('Sign out and sign in', async () => {
      await page.getByRole('button', { name: /sign out/i }).click();
      await expect(page).toHaveURL(/\/($|login)/, { timeout: 30_000 });
      await signInUser(page, credentials.email, credentials.password);
    });

    await test.step('Login restore — integrations + overview milestone', async () => {
      await openIntegrations(page);
      for (const { title } of DATABASE_CARDS) {
        await expectOrLogAt(BUG_LOG, `login-restore-connected-${title}`, async () => {
          await expect(card(page, title).getByText('Connected', { exact: true })).toBeVisible({
            timeout: 30_000,
          });
        });
      }
      await expectOrLogAt(BUG_LOG, 'login-restore-no-validating', async () => {
        await expect(page.getByText('Validating')).toHaveCount(0);
        await expect(page.getByText('Setting up')).toHaveCount(0);
      });

      await page.goto(`${siteOrigin}/dashboard`);
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLogAt(BUG_LOG, 'login-restore-milestone', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toBeVisible({
          timeout: 60_000,
        });
      });
    });

    console.log(`[live-reg-login] Finished — bugs (if any): ${BUG_LOG}`);
  });
});
