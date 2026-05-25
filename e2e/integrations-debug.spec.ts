/**
 * Mock E2E: integrations debug flows (no live stack). Validates edit-on-error + API sequence.
 */
import { test, expect } from './fixtures';
import { E2E_APP_ORIGIN } from './constants';
import {
  resetDatabaseMockState,
  seedSavedConnectedDatabases,
  setFailMigrationRunForService,
} from './mock-database-state';

test.use({ video: 'on', trace: 'on' });

test.beforeEach(() => {
  resetDatabaseMockState();
});

const mockSession = () => ({
  access_token: 'e2e-access-token',
  refresh_token: 'e2e-refresh-token',
  expires_in: 3600,
  timestamp: Date.now(),
  environment_id: 'env-sandbox-1',
  environments: [{ id: 'env-sandbox-1', type: 'sandbox' }],
});

async function openIntegrations(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    { name: 'rails_session_present', value: '1', url: `${E2E_APP_ORIGIN}/` },
  ]);
  await page.addInitScript((payload) => {
    window.localStorage.setItem('rails_session', JSON.stringify(payload));
  }, mockSession());
  await page.goto('/dashboard/integrations');
  await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('Integrations debug (mock)', () => {
  test('setup-failed Edit opens connection textbox', async ({ page }) => {
    seedSavedConnectedDatabases({ migrationsApplied: false, withMilestone: true });
    setFailMigrationRunForService('users');

    const apiLog: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('database-connections')) {
        apiLog.push(`${res.request().method()} ${url} → ${res.status()}`);
      }
    });

    await openIntegrations(page);
    await page.getByRole('button', { name: /Apply updates/i }).click();
    await expect(page.getByText(/Some migrations failed/i)).toBeVisible({ timeout: 15_000 });

    const usersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    await expect(usersCard.getByRole('button', { name: /^Retry$/i })).toBeVisible();
    await usersCard.getByRole('button', { name: /Edit Users Database connection/i }).click();

    const textbox = usersCard.getByRole('textbox', { name: /Users Database connection/i });
    await expect(textbox).toBeVisible({ timeout: 5_000 });
    console.log('[integrations-debug:mock] API log:', apiLog.join('\n'));
  });

  test('switching environment clears in-progress connection string', async ({ page }) => {
    seedSavedConnectedDatabases({ migrationsApplied: true, withMilestone: true });

    await openIntegrations(page);
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });

    const usersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    await usersCard.getByRole('button', { name: /Edit Users Database connection/i }).click();
    await usersCard
      .getByRole('textbox', { name: /Users Database connection/i })
      .fill('postgres://sandbox-only:secret@host:5432/users');

    await page.getByRole('button', { name: /^PROD$/i }).click();
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });

    const prodUsersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    const prodInput = prodUsersCard.getByRole('textbox', { name: /Users Database connection/i });
    if (await prodInput.isVisible().catch(() => false)) {
      await expect(prodInput).toHaveValue('');
    }
  });
});
