import { test, expect } from './fixtures';
import { E2E_APP_ORIGIN } from './constants';

const mockSession = () => ({
  access_token: 'e2e-access-token',
  refresh_token: 'e2e-refresh-token',
  expires_in: 3600,
  timestamp: Date.now(),
  environment_id: 'env-sandbox-1',
  environments: [{ id: 'env-sandbox-1', type: 'sandbox' }],
});

test.describe('Dashboard', () => {
  test('redirects to login without session', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('loads dashboard with session cookie and storage', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, mockSession());

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('logout returns to home', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, mockSession());

    await page.goto('/dashboard');
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  });
});
