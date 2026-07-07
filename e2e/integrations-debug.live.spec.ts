/**
 * Live debug: integrations UI flow + API traffic (headed).
 * Prereqs: rails-web on LIVE_SITE_URL, BFF + enterprise up, LIVE_MOCK_PASSWORD set.
 *
 * Run:
 *   LIVE_HEADED=1 LIVE_SLOW_MO=600 npx playwright test e2e/integrations-debug.live.spec.ts -c playwright.live.config.ts
 */
import { test, expect } from '@playwright/test';
import {
  card,
  openIntegrations,
  signInUser,
  siteOrigin,
} from './live-journey-shared';

const liveEmail = process.env.LIVE_DEBUG_EMAIL?.trim();
const livePassword = process.env.LIVE_MOCK_PASSWORD?.trim();

test.describe('Integrations debug (live)', () => {
  test('capture refresh, edit, repair, apply-updates visibility', async ({ page }) => {
    test.skip(!livePassword, 'Set LIVE_MOCK_PASSWORD for live debug run');

    const apiLog: { method: string; url: string; status?: number }[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes('/api/v1/database-connections')) {
        return;
      }
      apiLog.push({
        method: response.request().method(),
        url,
        status: response.status(),
      });
      console.log(`[integrations-debug:api] ${response.request().method()} ${url} → ${response.status()}`);
    });

    if (liveEmail) {
      await signInUser(page, liveEmail, livePassword!);
    } else {
      test.skip(true, 'Set LIVE_DEBUG_EMAIL to an existing admin email for this run');
    }

    await openIntegrations(page);

    await test.step('Initial load — wait for skeletons to clear', async () => {
      await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
        timeout: 60_000,
      });
      console.log('[integrations-debug] skeletons cleared');
    });

    await test.step('Reload — observe optimistic green → final state', async () => {
      const usersCard = card(page, 'Users Database');
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
        timeout: 30_000,
      });
      const connectedVisible = await usersCard.getByText('Connected', { exact: true }).isVisible().catch(() => false);
      console.log(`[integrations-debug] users Connected visible immediately after reload: ${connectedVisible}`);
      await page.waitForTimeout(3000);
      const needsAttention = await usersCard.getByText('Needs attention').isVisible().catch(() => false);
      const setupFailed = await usersCard.getByText(/Setting up|schema setup/i).isVisible().catch(() => false);
      console.log(
        `[integrations-debug] users after 3s — needsAttention=${needsAttention} setupFailedText=${setupFailed}`
      );
    });

    const applyUpdates = page.getByRole('button', { name: /Apply updates/i });
    const applyVisible = await applyUpdates.isVisible().catch(() => false);
    console.log(`[integrations-debug] Apply updates banner visible: ${applyVisible}`);

    const repairLinks = page.getByRole('link', { name: /Repair connection/i });
    const repairCount = await repairLinks.count();
    console.log(`[integrations-debug] Repair connection links on page: ${repairCount}`);
    if (repairCount > 0) {
      const href = await repairLinks.first().getAttribute('href');
      console.log(`[integrations-debug] Repair href: ${href}`);
      await repairLinks.first().click();
      await expect(page).toHaveURL(/\/dashboard\/integrations/);
      console.log(`[integrations-debug] URL after repair click: ${page.url()}`);
    }

    const usersCard = card(page, 'Users Database');
    const editBtn = usersCard.getByRole('button', { name: /^Edit$/i });
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      const textboxVisible = await usersCard
        .getByRole('textbox', { name: /Users Database connection/i })
        .isVisible()
        .catch(() => false);
      console.log(`[integrations-debug] After Edit click, connection textbox visible: ${textboxVisible}`);
      expect(textboxVisible).toBe(true);
    } else {
      console.log('[integrations-debug] Edit button not visible on Users card — check error/setup-failed state');
    }

    console.log('[integrations-debug] API calls captured:', JSON.stringify(apiLog, null, 2));
  });
});
