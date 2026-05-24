import { test, expect } from './fixtures';
import { E2E_APP_ORIGIN } from './constants';
import {
  E2E_PROD_ENV_ID,
  E2E_SANDBOX_ENV_ID,
  e2eSessionWithBothEnvironments,
} from './mock-api';

test.describe('Environment membership (RAI-65.11)', () => {
  test('register returns sandbox and production environments', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/register');

    await page.getByPlaceholder('Acme Institutional').fill('E2E Membership Bank');
    await page.getByPlaceholder('Alice').fill('Mem');
    await page.locator('input[name="admin_last_name"]').fill('Ber');
    await page.getByPlaceholder('admin@acme.com').fill(`mem-e2e+${Date.now()}@example.com`);
    await page.locator('input[name="admin_password"]').fill('long-password-e2e-1');

    await page.getByRole('button', { name: /create my account/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText('SANDBOX').first()).toBeVisible();
  });

  test('admin can switch to production and open integrations without permission banner', async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, e2eSessionWithBothEnvironments());

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible();

    await page.goto('/dashboard/integrations');
    await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('api-key-creation-blocked-banner')).toHaveCount(0);
    await expect(page.getByText(/don't have permission/i)).toHaveCount(0);

    await page.getByRole('tab', { name: /API Key/i }).click();
    await expect(page.getByTestId('api-key-manager')).toBeVisible({ timeout: 10_000 });
  });

  test('production API keys load for admin in production environment', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, e2eSessionWithBothEnvironments());

    await page.goto('/dashboard/integrations');
    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible();

    await page.getByRole('tab', { name: /API Key/i }).click();
    await expect(page.getByTestId('api-key-manager')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Active/i)).toBeVisible();
    await expect(page.getByText(/don't have permission/i)).toHaveCount(0);
  });

  test('mobile navigation drawer opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, e2eSessionWithBothEnvironments());

    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-mobile-menu-open')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('dashboard-mobile-menu-open').click();
    await expect(page.getByTestId('dashboard-mobile-menu-backdrop')).toBeVisible();
    await expect(page.getByTestId('dashboard-sidebar')).toBeVisible();

    await page.getByTestId('dashboard-mobile-menu-close').click();
    await expect(page.getByTestId('dashboard-mobile-menu-backdrop')).toHaveCount(0);
  });
});
