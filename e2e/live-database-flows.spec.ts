/**
 * Live stack recordings: rails-web + rails-client-server + rails-enterprise (Docker :8080 or remote).
 * No API mocks. Set LIVE_* env vars (see scripts/record-live-flows.sh).
 */
import { test, expect } from '@playwright/test';
import {
  card,
  dbUrls,
  hasLiveDatabaseUrls,
  openIntegrations,
  registerFreshUser,
  siteOrigin,
} from './live-journey-shared';

test.describe('Live BYOD recordings', () => {
  test.describe.configure({ mode: 'serial' });

  test('happy path — connect databases, apply migrations, create API key', async ({ page }) => {
    test.skip(!hasLiveDatabaseUrls(), 'Set LIVE_DB_* URLs (see scripts/record-live-flows.sh)');

    await registerFreshUser(page);
    await openIntegrations(page);

    const titles = [
      { title: 'Accounts Database', url: dbUrls.accounts },
      { title: 'Users Database', url: dbUrls.users },
      { title: 'Ledger Database', url: dbUrls.ledger },
      { title: 'Audit Services Database', url: dbUrls.audit },
    ] as const;

    for (const { title, url } of titles) {
      const section = card(page, title);
      await section.getByRole('textbox', { name: new RegExp(`${title} connection`, 'i') }).fill(url);
      await section.getByRole('button', { name: /^Connect$/i }).click();
      await expect(section.getByText('Connected', { exact: true })).toBeVisible({ timeout: 120_000 });
    }

    const updatesBanner = page.getByText(/database schema updates are ready to apply/i);
    if (await updatesBanner.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Apply updates/i }).click();
      await expect(page.getByText(/applied successfully|already up to date/i)).toBeVisible({
        timeout: 120_000,
      });
    }

    await page.goto(`${siteOrigin}/dashboard`);
    await page.getByRole('button', { name: /Manage API Key/i }).click();
    await page.locator('#api-keys').getByRole('button', { name: /^Create$/i }).click();
    await expect(page.getByText(/pk_|API key|plaintext/i)).toBeVisible({ timeout: 30_000 });
  });

  test('unhappy path — invalid connection, blocked API key', async ({ page }) => {
    await registerFreshUser(page);
    await openIntegrations(page);

    const accountsCard = page.locator('section').filter({ hasText: 'Accounts Database' }).first();
    await accountsCard
      .getByRole('textbox', { name: /Accounts Database connection/i })
      .fill('postgres://bad:bad@invalid-host:5432/accounts');
    await accountsCard.getByRole('button', { name: /^Connect$/i }).click();

    await expect(accountsCard.getByText('Needs attention')).toBeVisible({ timeout: 60_000 });
    await expect(accountsCard.getByText('did not validate')).toBeVisible();

    await page.goto(`${siteOrigin}/dashboard`);
    const connectStep = page.getByRole('heading', { name: 'Connect Databases', exact: true }).locator('..');
    await expect(connectStep.getByText('Action required')).toBeVisible();
    const apiKeyStep = page.getByRole('heading', { name: 'Generate API Key', exact: true }).locator('..');
    await expect(apiKeyStep.getByRole('button', { name: /^Locked$/i })).toBeVisible();
  });
});
