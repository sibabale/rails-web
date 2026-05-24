/**
 * Edge-case database integration specs (invalid connect, seeded login-restore, partial Apply).
 *
 * The merged happy-path journey (register → connect → login → edit) lives in
 * `byod-full-journey.spec.ts` — run with `npm run test:e2e:journey`.
 */
import { test, expect } from './fixtures';
import { E2E_APP_ORIGIN } from './constants';
import {
  resetDatabaseMockState,
  seedPartialDatabaseConnections,
  seedSavedConnectedDatabases,
  setFailMigrationRunForService,
  setInvalidateAccountsOnValidate,
  setRecoverInvalidServiceOnValidate,
  SEED_CONNECTION_STRING,
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

const openIntegrationsAsAdmin = async (page: import('@playwright/test').Page) => {
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

  await page.goto('/dashboard/integrations');
  await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
    timeout: 15_000,
  });
};

test.describe('Database integrations edge cases', () => {
  test('unhappy path: invalid connection shows needs attention and blocks API key', async ({ page }) => {
    await openIntegrationsAsAdmin(page);

    const accountsCard = page.locator('section').filter({ hasText: 'Accounts Database' }).first();
    await accountsCard
      .getByRole('textbox', { name: /Accounts Database connection/i })
      .fill('postgres://bad:bad@invalid-host:5432/accounts');
    await accountsCard.getByRole('button', { name: /^Connect$/i }).click();

    await expect(accountsCard.getByText('Needs attention')).toBeVisible({ timeout: 10_000 });
    await expect(accountsCard.getByText('did not validate')).toBeVisible();

    await page.goto('/dashboard');
    const connectStep = page.getByRole('heading', { name: 'Connect Databases', exact: true }).locator('..');
    await expect(connectStep.getByText('Action required')).toBeVisible();
    const apiKeyStep = page.getByRole('heading', { name: 'Generate API Key', exact: true }).locator('..');
    await expect(apiKeyStep.getByRole('button', { name: /^Locked$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Manage API Key/i })).toHaveCount(0);
  });

  test('login restore: silent validate flips invalid without setup phases', async ({ page }) => {
    seedSavedConnectedDatabases({ migrationsApplied: true, withMilestone: true });
    setInvalidateAccountsOnValidate(true);

    await openIntegrationsAsAdmin(page);

    const accountsCard = page.locator('section').filter({ hasText: 'Accounts Database' }).first();
    await expect(accountsCard.getByText('Needs attention')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Validating')).toHaveCount(0);
  });

  test('apply updates with partial failure shows failed service footer', async ({ page }) => {
    seedSavedConnectedDatabases({ migrationsApplied: false, withMilestone: true });
    setFailMigrationRunForService('accounts');

    await openIntegrationsAsAdmin(page);
    await expect(page.getByText(/database schema updates are ready to apply/i)).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: /Apply updates/i }).click();
    await expect(page.getByText(/Some migrations failed/i)).toBeVisible({ timeout: 10_000 });

    const accountsCard = page.locator('section').filter({ hasText: 'Accounts Database' }).first();
    await expect(accountsCard.getByText(/schema migration failed/i)).toBeVisible({ timeout: 10_000 });

    const usersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    await expect(usersCard.getByText(/Schema migrations are applied/i)).toBeVisible({ timeout: 10_000 });
  });

  test('invalid connection retry shows setup progress then connected', async ({ page }) => {
    await openIntegrationsAsAdmin(page);

    const accountsCard = page.locator('section').filter({ hasText: 'Accounts Database' }).first();
    await accountsCard
      .getByRole('textbox', { name: /Accounts Database connection/i })
      .fill('postgres://bad:bad@invalid-host:5432/accounts');
    await accountsCard.getByRole('button', { name: /^Connect$/i }).click();

    await expect(accountsCard.getByText('Needs attention')).toBeVisible({ timeout: 10_000 });
    setRecoverInvalidServiceOnValidate('accounts');

    await accountsCard.getByRole('button', { name: /^Retry$/i }).click();
    await expect(accountsCard.getByTestId('database-connection-setup-progress')).toBeVisible({
      timeout: 500,
    });
    await expect(accountsCard.getByText('Validating')).toBeVisible();
    await expect(accountsCard.getByText('Connected', { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(accountsCard.getByText('Validating')).toHaveCount(0);
  });

  test('schema setup failure shows a single alert per card', async ({ page }) => {
    await openIntegrationsAsAdmin(page);

    const usersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    const failureCopy =
      /required schema setup could not finish/i;

    await usersCard
      .getByRole('textbox', { name: /Users Database connection/i })
      .fill('postgres://rails:e2e@db.example.com:5432/users-migration-fail');
    await usersCard.getByRole('button', { name: /^Connect$/i }).click();

    await expect(usersCard.getByText(failureCopy)).toBeVisible({ timeout: 10_000 });
    await expect(usersCard.getByText(failureCopy)).toHaveCount(1);
    await expect(usersCard.getByRole('alert')).toHaveCount(1);
    await expect(usersCard.getByText('Connected', { exact: true })).toHaveCount(0);
    await expect(usersCard.getByTestId('setup-step-failed')).toBeVisible();
  });

  test('global banner lists repair-only services, not never-connected', async ({ page }) => {
    seedPartialDatabaseConnections({ withMilestone: true });

    await openIntegrationsAsAdmin(page);

    const ledgerCard = page.locator('section').filter({ hasText: 'Ledger Database' }).first();
    const auditCard = page.locator('section').filter({ hasText: 'Audit Services Database' }).first();
    await expect(
      ledgerCard.getByRole('textbox', { name: /Ledger Database connection/i })
    ).toBeVisible();
    await expect(
      auditCard.getByRole('textbox', { name: /Audit Services Database connection/i })
    ).toBeVisible();

    const usersCard = page.locator('section').filter({ hasText: 'Users Database' }).first();
    await expect(usersCard.getByText('Needs attention')).toBeVisible({ timeout: 10_000 });

    const healthBanner = page.getByText('Database connection issue');
    await expect(healthBanner).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Users database is not healthy/i)).toBeVisible();
    await expect(page.getByText(/Ledger database is not healthy/i)).toHaveCount(0);
    await expect(page.getByText(/Audit database is not healthy/i)).toHaveCount(0);

    await page.goto('/dashboard');
    await expect(healthBanner).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Users database is not healthy/i)).toBeVisible();
    await expect(page.getByText(/Ledger database is not healthy/i)).toHaveCount(0);
    await expect(page.getByText(/Audit database is not healthy/i)).toHaveCount(0);
  });

  test('seeded edit: same connection string shows unchanged notice', async ({ page }) => {
    seedSavedConnectedDatabases({ migrationsApplied: true, withMilestone: true });

    await openIntegrationsAsAdmin(page);

    const accountsCard = page.locator('section').filter({ hasText: 'Accounts Database' }).first();
    await expect(accountsCard.getByText('Connected', { exact: true })).toBeVisible({ timeout: 2_000 });

    await accountsCard.getByRole('button', { name: /Edit/i }).click();
    await accountsCard
      .getByRole('textbox', { name: /Accounts Database connection/i })
      .fill(`${SEED_CONNECTION_STRING}/accounts`);
    await accountsCard.getByRole('button', { name: /Save replacement/i }).click();

    await expect(accountsCard.getByText(/same connection string already saved/i)).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText('Validating')).toHaveCount(0);
    await expect(page.getByText('Setting up')).toHaveCount(0);
    await expect(accountsCard.getByText('Connected', { exact: true })).toBeVisible();
  });
});
