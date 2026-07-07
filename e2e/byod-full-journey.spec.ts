/**
 * Merged BYOD E2E journey (RAI-21 → RAI-22 → RAI-23) in one serial flow:
 * 1. Register fresh admin
 * 2. Connect all databases + apply migrations + milestone (RAI-21)
 * 3. Sign out → sign in as same user → login restore (RAI-22)
 * 4. Edit connection: unchanged string + changed replacement (RAI-23)
 *
 * Run headed in realtime:
 *   npm run test:e2e:journey
 *
 * Bugs are appended to e2e/artifacts/byod-journey-bugs.jsonl (test continues).
 */
import { test, expect } from './fixtures';
import {
  BYOD_JOURNEY_BUG_LOG,
  clearJourneyBugLog,
  expectOrLog,
  logJourneyBug,
} from './journey-bug-log';

test.describe.configure({ mode: 'serial' });

test.use({
  video: 'on',
  trace: 'on',
  launchOptions: { slowMo: 300 },
});

const DB_CONNECTION_BASE = 'postgres://rails:e2e@db.example.com:5432';

const DATABASE_CARDS = [
  { key: 'accounts' as const, title: 'Accounts Database' },
  { key: 'users' as const, title: 'Users Database' },
  { key: 'ledger' as const, title: 'Ledger Database' },
  { key: 'audit' as const, title: 'Audit Services Database' },
];

function connectionStringFor(service: (typeof DATABASE_CARDS)[number]['key']): string {
  return `${DB_CONNECTION_BASE}/${service}`;
}

function card(page: import('@playwright/test').Page, title: string) {
  return page.locator('section').filter({
    has: page.getByRole('heading', { name: title }),
  });
}

test.describe('BYOD full journey', () => {
  test.beforeAll(() => {
    clearJourneyBugLog();
    console.log(`[BYOD-JOURNEY] Bug log: ${BYOD_JOURNEY_BUG_LOG}`);
  });

  test('registration → connect → login restore → edit', async ({ page }) => {
    test.setTimeout(120_000);
    const runId = Date.now();
    const email = `byod-journey-${runId}@example.com`;
    const password = 'Password123!';
    const savedConnectionStrings: Record<string, string> = {};

    // ── RAI-21: Registration ──────────────────────────────────────────────
    await test.step('Register fresh admin', async () => {
      console.log('[BYOD-JOURNEY] Step 1 — Register');
      await page.goto('/register');
      await page.getByLabel('Company Name').fill(`BYOD Journey ${runId}`);
      await page.getByLabel('Admin First Name').fill('Journey');
      await page.getByLabel('Admin Last Name').fill('Tester');
      await page.getByLabel('Admin Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByTestId('register-submit').click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
      await page.evaluate(() => {
        localStorage.removeItem('rails_onboarding');
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('rails_database_setup_completed')) {
            localStorage.removeItem(key);
          }
        }
      });
    });

    await test.step('Fresh user sees database onboarding required', async () => {
      await page.goto('/dashboard/integrations');
      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
        timeout: 15_000,
      });
      await expectOrLog('registration-empty-state', async () => {
        await expect(page.getByRole('button', { name: /^Connect$/i })).toHaveCount(4);
        await expect(page.getByText('Connected', { exact: true })).toHaveCount(0);
      });
    });

    // ── RAI-21: Connect all services with setup phases ────────────────────
    await test.step('Connect all four databases', async () => {
      console.log('[BYOD-JOURNEY] Step 2 — Connect all databases');
      for (const { key, title } of DATABASE_CARDS) {
        const url = connectionStringFor(key);
        savedConnectionStrings[key] = url;
        const section = card(page, title);
        await section.getByRole('textbox', { name: new RegExp(`${title} connection`, 'i') }).fill(url);
        await section.getByRole('button', { name: /^Connect$/i }).click();

        await expectOrLog(`connect-phases-${key}`, async () => {
          await expect(section.getByText('Validating')).toBeVisible({ timeout: 5_000 });
        });

        await expect(section.getByText('Connected', { exact: true })).toBeVisible({ timeout: 15_000 });
      }
    });

    await test.step('Overview Step 1 still incomplete before migrations apply', async () => {
      console.log('[BYOD-JOURNEY] Step 3a — Milestone gated until apply');
      await page.goto('/dashboard');
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLog('milestone-incomplete-before-apply', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toHaveCount(0);
        await expect(connectStep.getByText('Configure Integrations')).toBeVisible({
          timeout: 10_000,
        });
      });
      await page.goto('/dashboard/integrations');
    });

    await test.step('Apply database schema updates', async () => {
      console.log('[BYOD-JOURNEY] Step 3 — Apply updates');
      await expectOrLog('apply-banner-visible', async () => {
        await expect(page.getByText(/database schema updates are ready to apply/i)).toBeVisible({
          timeout: 10_000,
        });
      });
      await page.getByRole('button', { name: /Apply updates/i }).click();
      await expectOrLog('apply-success', async () => {
        await expect(page.getByText(/applied successfully|already up to date/i)).toBeVisible({
          timeout: 15_000,
        });
      });
    });

    await test.step('Overview milestone shows Connect Databases complete', async () => {
      console.log('[BYOD-JOURNEY] Step 4 — Milestone on overview');
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLog('milestone-connected', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toBeVisible({
          timeout: 10_000,
        });
      });
    });

    // ── RAI-22: Login restore ─────────────────────────────────────────────
    await test.step('Sign out and sign back in', async () => {
      console.log('[BYOD-JOURNEY] Step 5 — Logout / login');
      await page.getByRole('button', { name: /sign out/i }).click();
      await expect(page).toHaveURL(/\/($|login)/, { timeout: 15_000 });

      await page.goto('/login');
      await page.getByPlaceholder('admin@example.com').fill(email);
      await page.getByPlaceholder('••••••••••••').fill(password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
    });

    await test.step('Login restore: Connected immediately without setup phases', async () => {
      console.log('[BYOD-JOURNEY] Step 6 — Login restore on integrations');
      await page.goto('/dashboard/integrations');
      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
        timeout: 15_000,
      });

      const accountsSection = card(page, 'Accounts Database');
      await expect(accountsSection.getByText('Connected', { exact: true })).toBeVisible({
        timeout: 3_000,
      });

      await expectOrLog('login-restore-no-validating', async () => {
        await expect(page.getByText('Validating')).toHaveCount(0);
        await expect(page.getByText('Setting up')).toHaveCount(0);
      });

      await expectOrLog('login-restore-no-skeleton', async () => {
        await expect(page.getByTestId('database-connection-skeleton-accounts')).toHaveCount(0);
      });

      await page.goto('/dashboard');
      const connectStep = page
        .getByRole('heading', { name: 'Connect Databases', exact: true })
        .locator('..');
      await expectOrLog('login-restore-milestone-stays-complete', async () => {
        await expect(connectStep.getByRole('button', { name: 'Connected' })).toBeVisible({
          timeout: 10_000,
        });
      });
    });

    // ── RAI-23: Edit safety ───────────────────────────────────────────────
    await test.step('Edit same connection string shows unchanged notice', async () => {
      console.log('[BYOD-JOURNEY] Step 7 — Edit unchanged string');
      await page.goto('/dashboard/integrations');
      const accountsSection = card(page, 'Accounts Database');
      await expect(accountsSection.getByText('Connected', { exact: true })).toBeVisible({
        timeout: 5_000,
      });

      await accountsSection.getByRole('button', { name: /Edit/i }).click();
      await accountsSection
        .getByRole('textbox', { name: /Accounts Database connection/i })
        .fill(savedConnectionStrings.accounts);

      await accountsSection.getByRole('button', { name: /^Save$/i }).click();

      await expectOrLog('edit-unchanged-notice', async () => {
        const notice = accountsSection.getByText(/same connection string already saved/i);
        await expect(notice.first()).toBeVisible({ timeout: 8_000 });
        const count = await notice.count();
        if (count > 1) {
          logJourneyBug(
            'edit-unchanged-duplicate-notice',
            `Unchanged notice rendered ${count} times on Accounts card (expected 1)`,
          );
        }
      });

      await expectOrLog('edit-unchanged-no-phases', async () => {
        await expect(page.getByText('Validating')).toHaveCount(0);
        await expect(page.getByText('Setting up')).toHaveCount(0);
      });

      await expect(accountsSection.getByText('Connected', { exact: true })).toBeVisible();
    });

    await test.step('Edit with different string runs setup phases', async () => {
      console.log('[BYOD-JOURNEY] Step 8 — Edit changed string');
      const accountsSection = card(page, 'Accounts Database');
      const replacement = `${DB_CONNECTION_BASE}/accounts-rotated-${runId}`;

      await accountsSection.getByRole('button', { name: /Edit/i }).click();
      await accountsSection
        .getByRole('textbox', { name: /Accounts Database connection/i })
        .fill(replacement);
      await accountsSection.getByRole('button', { name: /^Save$/i }).click();

      await expectOrLog('edit-changed-shows-phases', async () => {
        await expect(accountsSection.getByText('Validating')).toBeVisible({ timeout: 5_000 });
      });

      await expect(accountsSection.getByText('Connected', { exact: true })).toBeVisible({
        timeout: 15_000,
      });
      savedConnectionStrings.accounts = replacement;
    });

    await test.step('Apply updates disables card interactions globally', async () => {
      console.log('[BYOD-JOURNEY] Step 9 — Apply lock (smoke)');
      const applyButton = page.getByRole('button', { name: /Apply updates/i });
      if (!(await applyButton.isVisible().catch(() => false))) {
        logJourneyBug(
          'apply-lock-skipped',
          'Apply updates banner not visible after changed edit — skipping interactions lock check',
        );
        return;
      }

      await applyButton.click();
      const usersSection = card(page, 'Users Database');
      await expectOrLog('apply-lock-disables-edit', async () => {
        const editButton = usersSection.getByRole('button', { name: /Edit/i });
        if (await editButton.isVisible().catch(() => false)) {
          await expect(editButton).toBeDisabled({ timeout: 3_000 });
        }
      });

      await expect(page.getByText(/applied successfully|Some migrations failed|already up to date/i)).toBeVisible({
        timeout: 15_000,
      });
    });

    console.log('[BYOD-JOURNEY] Journey complete — review bug log if any warnings appeared.');
  });
});
