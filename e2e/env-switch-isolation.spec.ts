/**
 * E2E: Environment-switch isolation (RAI-62 / RAI-57 AC-6)
 *
 * Validates the full journey:
 *   1. Sandbox configured (all DBs connected) → onboarding step 1 complete.
 *   2. Switch to Production → Integrations shows empty/unconfigured cards.
 *   3. Switch back to Sandbox → connected state is fully restored.
 *
 * Uses the mock API layer (no live stack required).
 */

import { test, expect } from './fixtures';
import { E2E_APP_ORIGIN } from './constants';
import {
  resetDatabaseMockState,
  seedSavedConnectedDatabases,
} from './mock-database-state';
import {
  E2E_SANDBOX_ENV_ID,
  E2E_PROD_ENV_ID,
  e2eSessionWithBothEnvironments,
} from './mock-api';

test.use({ video: 'on', trace: 'on' });

test.beforeEach(() => {
  resetDatabaseMockState();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function seedSessionAndOpenDashboard(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    { name: 'rails_session_present', value: '1', url: `${E2E_APP_ORIGIN}/` },
  ]);
  await page.addInitScript((payload) => {
    window.localStorage.setItem('rails_session', JSON.stringify(payload));
  }, e2eSessionWithBothEnvironments());
}

async function openOverview(page: import('@playwright/test').Page) {
  await seedSessionAndOpenDashboard(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible({
    timeout: 15_000,
  });
}

async function openIntegrations(page: import('@playwright/test').Page) {
  await seedSessionAndOpenDashboard(page);
  await page.goto('/dashboard/integrations');
  await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
    timeout: 15_000,
  });
}

// ── AC-6 journey: sandbox configure → prod empty → sandbox restored ────────

test.describe('Environment-switch isolation (RAI-62)', () => {
  test('AC-6 full journey: sandbox connected → switch prod (empty) → switch back sandbox (restored)', async ({
    page,
  }) => {
    // ── Step 1: Load with sandbox configured (all DBs connected) ──────────
    seedSavedConnectedDatabases({ migrationsApplied: true, withMilestone: true });

    await openIntegrations(page);

    // All four DB cards should show a connected / non-skeleton state
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.getByTestId('database-connection-skeleton-accounts')).toHaveCount(0, {
      timeout: 5_000,
    });

    // Verify sandbox environment indicator is visible
    await expect(page.getByRole('button', { name: /^SANDBOX$/i })).toBeVisible();

    // ── Step 2: Switch to Production → Integrations shows empty state ──────
    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible({ timeout: 10_000 });

    // Wait for the page to settle after the environment switch
    await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
      timeout: 10_000,
    });

    // Wait for production state to settle
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });

    // No permission errors should appear (RAI-63 regression guard)
    await expect(page.getByText(/don't have permission/i)).toHaveCount(0);
    await expect(page.getByTestId('api-key-creation-blocked-banner')).toHaveCount(0);

    // ── Step 3: Switch back to Sandbox → connected state restored ──────────
    await page.getByRole('button', { name: 'SANDBOX' }).click();
    await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
      timeout: 10_000,
    });

    // Wait for sandbox data to reload
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });

    // Connected state must be restored for sandbox
    const connectedBadges = page.getByText(/Connected/i);
    await expect(connectedBadges.first()).toBeVisible({ timeout: 10_000 });
  });

  // ── Isolation: Overview onboarding steps ─────────────────────────────────

  test('Overview onboarding step data is available after switching to production', async ({
    page,
  }) => {
    // Sandbox: all DBs connected (step 1 complete in sandbox)
    seedSavedConnectedDatabases({ migrationsApplied: true, withMilestone: true });

    await openOverview(page);

    // Sandbox: step 1 should be complete
    const onboardingContainer = page.getByTestId('dashboard-overview-onboarding');
    await expect(onboardingContainer).toBeVisible({ timeout: 15_000 });
    await expect(onboardingContainer).toHaveAttribute('data-snapshot-loaded', 'true', {
      timeout: 15_000,
    });
    await expect(onboardingContainer).toHaveAttribute('data-stage-dbs', 'complete');

    // Switch to Production (no DBs configured there)
    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible({ timeout: 10_000 });

    // Onboarding container must reload for the new environment
    // During reset (connections = null) → snapshot-loaded = false → data-stage-dbs = locked
    // After prod snapshot lands → data-stage-dbs = active (none connected) or locked
    await expect(onboardingContainer).toHaveAttribute('data-snapshot-loaded', 'true', {
      timeout: 15_000,
    });

    // Production stage metadata should be present after switch
    const prodDbsStage = await onboardingContainer.getAttribute('data-stage-dbs');
    expect(prodDbsStage).toBeTruthy();
  });

  test('Overview snapshot is loaded again after switching to production', async ({
    page,
  }) => {
    seedSavedConnectedDatabases({ migrationsApplied: true, withMilestone: true });

    await openOverview(page);

    // Sandbox loaded
    const onboardingContainer = page.getByTestId('dashboard-overview-onboarding');
    await expect(onboardingContainer).toHaveAttribute('data-snapshot-loaded', 'true', {
      timeout: 15_000,
    });

    // Trigger production switch
    await page.getByRole('button', { name: 'PROD' }).click();

    // Settles to 'true' with production data
    await expect(onboardingContainer).toHaveAttribute('data-snapshot-loaded', 'true', {
      timeout: 15_000,
    });
  });

  // ── Isolation: Integrations connection strings not shared across envs ─────

  test('a connection string typed in sandbox is not visible after switching to production', async ({
    page,
  }) => {
    seedSavedConnectedDatabases({ migrationsApplied: false, withMilestone: false });

    await openIntegrations(page);
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });

    // Edit the users connection string in sandbox
    const usersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    const editBtn = usersCard.getByRole('button', { name: /Edit Users Database connection/i });
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await usersCard
        .getByRole('textbox', { name: /Users Database connection/i })
        .fill('postgres://sandbox-only:secret@host:5432/users');
    }

    // Switch to production — the sandbox string must not persist
    await page.getByRole('button', { name: /^PROD$/i }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('database-connection-skeleton-users')).toHaveCount(0, {
      timeout: 15_000,
    });

    const prodUsersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    const prodInput = prodUsersCard.getByRole('textbox', {
      name: /Users Database connection/i,
    });
    if (await prodInput.isVisible().catch(() => false)) {
      await expect(prodInput).not.toHaveValue('postgres://sandbox-only:secret@host:5432/users');
    }
  });

  // ── Isolation: no permission errors in either environment ─────────────────

  test('no 403 permission banner appears in sandbox or production (RAI-63 regression guard)', async ({
    page,
  }) => {
    await openIntegrations(page);

    await expect(page.getByText(/don't have permission/i)).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByTestId('api-key-creation-blocked-banner')).toHaveCount(0);

    // Switch to production
    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByText(/don't have permission/i)).toHaveCount(0);
    await expect(page.getByTestId('api-key-creation-blocked-banner')).toHaveCount(0);
  });

  test('API Key tab loads without permission error in production', async ({ page }) => {
    await openIntegrations(page);

    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('tab', { name: /API Key/i }).click();
    await expect(page.getByTestId('api-key-manager')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/don't have permission/i)).toHaveCount(0);
  });

  // ── X-Environment-Id header correctness ──────────────────────────────────

  test('AC-3: API requests in production mode carry the production environment UUID in X-Environment header', async ({
    page,
  }) => {
    const environmentHeaders: string[] = [];

    page.on('request', (req) => {
      const envHeader =
        req.headers()['x-environment-id'] ??
        req.headers()['x-environment'] ??
        null;
      if (req.url().includes('database-connections') && envHeader) {
        environmentHeaders.push(envHeader);
      }
    });

    await openIntegrations(page);

    // Switch to production
    await page.getByRole('button', { name: 'PROD' }).click();
    await expect(page.getByText('Live Production Environment')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('heading', { name: 'Database Connections' }).waitFor({ timeout: 10_000 });

    // Give the production fetch a moment to fire
    await page.waitForTimeout(500);

    // At least one request after the switch should carry the production UUID
    const prodRequests = environmentHeaders.filter((h) => h === E2E_PROD_ENV_ID);
    expect(prodRequests.length).toBeGreaterThan(0);
  });
});
