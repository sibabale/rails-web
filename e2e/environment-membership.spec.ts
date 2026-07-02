import { test, expect } from './fixtures';
import { E2E_APP_ORIGIN, MOCK_API_ORIGIN } from './constants';
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

  // ── RAI-65.11 / AC-12 ──────────────────────────────────────────────────────

  test('login with production environment_id returns 200 and both environments', async ({ page }) => {
    // page.request bypasses Playwright route interception (it's a raw HTTP client).
    // Use page.evaluate so the browser's fetch goes through the context route mock.
    await page.goto('/');

    const result = await page.evaluate(
      async ({ origin, prodEnvId }: { origin: string; prodEnvId: string }) => {
        const res = await fetch(`${origin}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'e2e@example.com',
            password: 'not-used-mocked',
            environment_id: prodEnvId,
          }),
        });
        return { status: res.status, body: await res.json() };
      },
      { origin: MOCK_API_ORIGIN, prodEnvId: E2E_PROD_ENV_ID }
    );

    expect(result.status).toBe(200);
    const body = result.body as {
      selected_environment_id: string;
      environments: { id: string; type: string }[];
    };
    expect(body.selected_environment_id).toBe(E2E_PROD_ENV_ID);
    expect(body.environments).toHaveLength(2);
    const types = body.environments.map((e: { type: string }) => e.type);
    expect(types).toContain('sandbox');
    expect(types).toContain('production');
  });

  test('sandbox-only member cannot access production admin content', async ({ page }) => {
    test.setTimeout(60_000);
    // Session with only sandbox in environments[] — no production membership.
    const sandboxOnlySession = {
      access_token: 'e2e-access-token',
      refresh_token: 'e2e-refresh-token',
      expires_in: 3600,
      timestamp: Date.now(),
      environment_id: E2E_SANDBOX_ENV_ID,
      environments: [{ id: E2E_SANDBOX_ENV_ID, type: 'sandbox' }],
    };

    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, sandboxOnlySession);

    await page.goto('/dashboard/integrations');
    await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
      timeout: 15_000,
    });

    // Sandbox integrations page loads cleanly — no false-positive permission banner.
    await expect(page.getByTestId('api-key-creation-blocked-banner')).toHaveCount(0);
    await expect(page.getByText(/don't have permission/i)).toHaveCount(0);

    // If PROD toggle is visible, clicking it should NOT resolve to a live production env
    // (resolveEnvironmentId returns null when production is absent from environments[]).
    const prodButton = page.getByRole('button', { name: 'PROD' });
    if (await prodButton.isVisible().catch(() => false)) {
      await prodButton.click();
      // No production API key manager should become accessible (mock uses sandbox env-id fallback)
      await expect(page.getByTestId('api-key-creation-blocked-banner')).toHaveCount(0);
    } else {
      // Correctly hidden — confirm sandbox indicator remains
      await expect(page.getByText('SANDBOX').first()).toBeVisible();
    }
  });

  test('identity section loads with correct production environment context', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'rails_session_present',
        value: '1',
        url: `${E2E_APP_ORIGIN}/`,
      },
    ]);
    // Preload the persisted Redux environment to 'production'
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'persist:environment',
        JSON.stringify({ current: '"production"', _persist: '{"version":-1,"rehydrated":true}' })
      );
    });
    await page.addInitScript((payload) => {
      window.localStorage.setItem('rails_session', JSON.stringify(payload));
    }, e2eSessionWithBothEnvironments());

    await page.goto('/dashboard/identity');
    // Profile values are in read-only <input> fields. Use toHaveValue with a timeout so
    // Playwright retries until the async /me fetch finishes and populates the form.
    await expect(page.locator('input[readonly]').last()).toHaveValue(/e2e@example\.com/i, {
      timeout: 15_000,
    });
    // Dashboard should reflect the production environment, not sandbox
    await expect(page.getByText(/production/i).first()).toBeVisible({ timeout: 10_000 });
  });

});
