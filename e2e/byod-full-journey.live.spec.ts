/**
 * True E2E BYOD journey — rails-web → rails-client-server → rails-enterprise.
 * No Playwright API mocks. Requires real Postgres URLs and a running stack.
 *
 * Run headed (watch in browser):
 *   ./scripts/run-live-journey.sh
 *
 * Prerequisites: rails-enterprise gateway (:8080), LIVE_DB_* URLs in .env
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
  signInUser,
  siteOrigin,
  variantConnectionString,
} from './live-journey-shared';
import {
  attachApiTimeline,
  logTimelineStep,
  startLiveTimeline,
  LIVE_JOURNEY_TIMELINE_LOG,
} from './live-journey-timeline';

const BFF_ORIGIN = process.env.LIVE_BFF_URL ?? 'http://127.0.0.1:3100';

test.describe.configure({ mode: 'serial' });

const CONNECT_TIMEOUT_MS = 180_000;
const APPLY_TIMEOUT_MS = 180_000;

test.describe('BYOD full journey (live stack)', () => {
  test.beforeAll(() => {
    startLiveTimeline();
    clearJourneyBugLogAt(BYOD_JOURNEY_LIVE_BUG_LOG);
    console.log(`[live-journey] Bug log: ${BYOD_JOURNEY_LIVE_BUG_LOG}`);
    console.log(`[live-journey] Timeline: ${LIVE_JOURNEY_TIMELINE_LOG}`);
    console.log(`[live-journey] Site: ${siteOrigin}`);
    console.log('[live-journey] Stack: rails-web → client-server → enterprise (no mocks)');
  });

  test('registration → connect → login restore → edit', async ({ page }) => {
    test.skip(!hasLiveDatabaseUrls(), 'Set LIVE_DB_* URLs in rails-enterprise/.env (see scripts/run-live-journey.sh)');

    attachApiTimeline(page, BFF_ORIGIN);

    const runId = Date.now();
    const savedConnectionStrings: Record<string, string> = {};
    let credentials: Awaited<ReturnType<typeof registerFreshUser>>;

    await test.step('Register fresh business + admin (real BFF)', async () => {
      logTimelineStep('step_register_start');
      credentials = await registerFreshUser(page);
      logTimelineStep('step_register_done', credentials.email);
    });

    await test.step('Fresh user sees empty database integrations', async () => {
      await openIntegrations(page);
      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'registration-empty-state', async () => {
        await expect(page.getByRole('button', { name: /^Connect$/i })).toHaveCount(4);
        await expect(page.getByText('Connected', { exact: true })).toHaveCount(0);
      });
    });

    await test.step('Connect all four databases (real pool + migrate)', async () => {
      logTimelineStep('step_connect_all_start');
      for (const { key, title } of DATABASE_CARDS) {
        const url = dbUrls[key];
        savedConnectionStrings[key] = url;
        const section = card(page, title);
        await section.getByRole('textbox', { name: new RegExp(`${title} connection`, 'i') }).fill(url);
        await section.getByRole('button', { name: /^Connect$/i }).click();

        await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, `connect-phases-${key}`, async () => {
          await expect(section.getByText('Validating')).toBeVisible({ timeout: 15_000 });
        });

        await expect(section.getByText('Connected', { exact: true })).toBeVisible({
          timeout: CONNECT_TIMEOUT_MS,
        });
        logTimelineStep(`step_connect_done_${key}`);
      }
    });

    await test.step('Apply database schema updates (real migrations)', async () => {
      console.log('[live-journey] Step 3 — Apply updates (real)');
      const banner = page.getByText(/database schema updates are ready to apply/i);
      const bannerVisible = await banner.isVisible().catch(() => false);
      if (!bannerVisible) {
        logJourneyBugAt(
          BYOD_JOURNEY_LIVE_BUG_LOG,
          'apply-banner-missing',
          'No pending updates banner after connect — migrations may already be applied',
        );
        return;
      }

      await page.getByRole('button', { name: /Apply updates/i }).click();
      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'apply-success', async () => {
        await expect(page.getByText(/applied successfully|already up to date/i)).toBeVisible({
          timeout: APPLY_TIMEOUT_MS,
        });
      });
    });

    await test.step('Overview milestone — Connect Databases complete', async () => {
      console.log('[live-journey] Step 4 — Milestone');
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
    });

    await test.step('Sign out and sign back in (real auth)', async () => {
      console.log('[live-journey] Step 5 — Logout / login (real)');
      await page.getByRole('button', { name: /sign out/i }).click();
      await expect(page).toHaveURL(/\/($|login)/, { timeout: 30_000 });
      await signInUser(page, credentials.email, credentials.password);
    });

    await test.step('Login restore — Connected without setup phases', async () => {
      console.log('[live-journey] Step 6 — Login restore');
      await openIntegrations(page);

      const accountsSection = card(page, 'Accounts Database');
      await expect(accountsSection.getByText('Connected', { exact: true })).toBeVisible({
        timeout: 10_000,
      });

      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'login-restore-no-validating', async () => {
        await expect(page.getByText('Validating')).toHaveCount(0);
        await expect(page.getByText('Setting up')).toHaveCount(0);
      });

      await page.goto(`${siteOrigin}/dashboard`);
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'login-restore-milestone', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toBeVisible({
          timeout: 30_000,
        });
      });
    });

    await test.step('Edit same connection string — unchanged notice', async () => {
      console.log('[live-journey] Step 7 — Edit unchanged (real API)');
      await openIntegrations(page);
      const accountsSection = card(page, 'Accounts Database');
      await accountsSection.getByRole('button', { name: /Edit/i }).click();
      await accountsSection
        .getByRole('textbox', { name: /Accounts Database connection/i })
        .fill(savedConnectionStrings.accounts);
      await accountsSection.getByRole('button', { name: /Save replacement/i }).click();

      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'edit-unchanged-notice', async () => {
        const notice = accountsSection.getByText(/same connection string already saved/i);
        await expect(notice.first()).toBeVisible({ timeout: 30_000 });
        const count = await notice.count();
        if (count > 1) {
          logJourneyBugAt(
            BYOD_JOURNEY_LIVE_BUG_LOG,
            'edit-unchanged-duplicate-notice',
            `Unchanged notice rendered ${count} times (expected 1)`,
          );
        }
      });

      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'edit-unchanged-no-phases', async () => {
        await expect(page.getByText('Validating')).toHaveCount(0);
        await expect(page.getByText('Setting up')).toHaveCount(0);
      });
    });

    await test.step('Edit with different string — setup phases + reconnect', async () => {
      console.log('[live-journey] Step 8 — Edit changed string (real)');
      const accountsSection = card(page, 'Accounts Database');
      const replacement = variantConnectionString(savedConnectionStrings.accounts, runId);

      await accountsSection.getByRole('button', { name: /Edit/i }).click();
      await accountsSection
        .getByRole('textbox', { name: /Accounts Database connection/i })
        .fill(replacement);
      await accountsSection.getByRole('button', { name: /Save replacement/i }).click();

      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'edit-changed-phases', async () => {
        await expect(accountsSection.getByText('Validating')).toBeVisible({ timeout: 15_000 });
      });

      await expect(accountsSection.getByText('Connected', { exact: true })).toBeVisible({
        timeout: CONNECT_TIMEOUT_MS,
      });
      savedConnectionStrings.accounts = replacement;
    });

    await test.step('Apply lock smoke (if updates pending)', async () => {
      console.log('[live-journey] Step 9 — Apply interactions lock');
      const applyButton = page.getByRole('button', { name: /Apply updates/i });
      if (!(await applyButton.isVisible().catch(() => false))) {
        logJourneyBugAt(
          BYOD_JOURNEY_LIVE_BUG_LOG,
          'apply-lock-skipped',
          'Apply banner not visible — skipping interactions lock check',
        );
        return;
      }

      await applyButton.click();
      const usersSection = card(page, 'Users Database');
      await expectOrLogAt(BYOD_JOURNEY_LIVE_BUG_LOG, 'apply-lock-disables-edit', async () => {
        const editButton = usersSection.getByRole('button', { name: /Edit/i });
        if (await editButton.isVisible().catch(() => false)) {
          await expect(editButton).toBeDisabled({ timeout: 5_000 });
        }
      });

      await expect(
        page.getByText(/applied successfully|Some migrations failed|already up to date/i),
      ).toBeVisible({ timeout: APPLY_TIMEOUT_MS });
    });

    console.log('[live-journey] Complete — review live bug log for soft failures.');
  });
});
