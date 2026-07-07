import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './fixtures';
import { MOCK_API_ORIGIN } from './constants';
import { e2eSessionWithBothEnvironments } from './mock-api';

type ChaosIssue = {
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  area: string;
  title: string;
  detail: string;
};

const ARTIFACTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts');
const CHAOS_LOG_FILE = path.join(ARTIFACTS_DIR, 'ui-flow-chaos-bugs.jsonl');

function resetChaosLog() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(CHAOS_LOG_FILE, '');
}

function logChaosIssue(issue: Omit<ChaosIssue, 'timestamp'>) {
  const full: ChaosIssue = { timestamp: new Date().toISOString(), ...issue };
  fs.appendFileSync(CHAOS_LOG_FILE, `${JSON.stringify(full)}\n`);
}

function addRuntimeErrorObservers(page: import('@playwright/test').Page) {
  page.on('pageerror', (error) => {
    logChaosIssue({
      severity: 'critical',
      area: 'runtime',
      title: 'Unhandled page error',
      detail: error.message,
    });
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const signal =
      /cannot update a component while rendering|unhandled|hydration failed|invariant|typeerror|referenceerror/i;
    if (!signal.test(text)) return;
    logChaosIssue({
      severity: 'high',
      area: 'runtime',
      title: 'Console runtime error',
      detail: text.slice(0, 800),
    });
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('UI flow chaos investigation', () => {
  test.beforeAll(() => {
    resetChaosLog();
    console.log(`[UI-FLOW-CHAOS] Bug log: ${CHAOS_LOG_FILE}`);
  });

  test('stresses cross-page navigation and weird interaction races', async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    addRuntimeErrorObservers(page);

    const runId = Date.now();
    const weirdCompanyName =
      `شركة-銀行-🚀-${runId}-${'x'.repeat(70)}`;
    const weirdFirstName = `Åß中🚀${'a'.repeat(40)}`;
    const weirdLastName = `مرحبا${'ב'.repeat(30)}`;
    const email = `chaos+${runId}@example.com`;
    const password = 'Password123!';

    await test.step('Marketing click race with rapid route changes', async () => {
      await page.goto('/');
      await expect(page.getByTestId('marketing-hero-heading')).toBeVisible();

      await page.getByRole('link', { name: 'Infrastructure' }).click();
      await page.getByRole('link', { name: 'Use Cases' }).click();
      await page.goto('/');

      await page.getByTestId('marketing-hero-sdk-toggle').click();
      await page.keyboard.press('Escape');
      await page.getByTestId('marketing-get-started-hero').click();
      await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
    });

    await test.step('Login page rapid back navigation stress', async () => {
      await page.goto('/login');
      const forgotButton = page.getByRole('button', { name: /forgot security credentials/i });
      if (await forgotButton.isVisible()) {
        await forgotButton.click();
        await page.waitForURL(/\/forgot-password/, { timeout: 10_000 }).catch(() => {
          return page.goto('/forgot-password');
        });
        await page.goBack();
        await page.waitForURL(/\/login/, { timeout: 5_000 }).catch(() => undefined);
        await page.goBack();
        await page.waitForURL(/\/$/, { timeout: 5_000 }).catch(() => undefined);
      }
    });

    await test.step('Register with extreme unicode/long input', async () => {
      await page.goto('/register');
      await page.getByLabel('Company Name').fill(weirdCompanyName);
      await page.getByLabel('Admin First Name').fill(weirdFirstName);
      await page.getByLabel('Admin Last Name').fill(weirdLastName);
      await page.getByLabel('Admin Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByTestId('register-submit').click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
      await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    });

    await test.step('Dashboard navigation race while state is changing', async () => {
      await page.goto('/dashboard/integrations');
      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible();

      const accountsInput = page.getByRole('textbox', {
        name: /accounts database connection string/i,
      });
      await accountsInput.fill(`postgres://rails:e2e@db.example.com:5432/accounts-chaos-${runId}`);
      await page.getByTestId('database-connection-save-accounts').click();

      await page.getByTestId('dashboard-nav-transactions').click();
      await page.getByTestId('dashboard-nav-integrations').click();
      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible();

      for (let i = 0; i < 3; i += 1) {
        await page.getByRole('button', { name: 'PROD' }).click();
        await page.getByRole('button', { name: 'SANDBOX' }).click();
      }

      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible();
    });

    await test.step('Mobile drawer stress: rapid open/close and nav taps', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/dashboard');

      const openMenu = page.getByTestId('dashboard-mobile-menu-open');
      const closeMenu = page.getByTestId('dashboard-mobile-menu-close');
      await openMenu.click();
      await closeMenu.click();
      await openMenu.click();
      await page.getByTestId('dashboard-nav-ledger').click();
      await expect(page).toHaveURL(/\/dashboard\/ledger$/, { timeout: 15_000 });
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    await test.step('Error-path resilience: network failure observation', async () => {
      await page.goto('/forgot-password');
      await page.getByLabel('Email address').fill(email);
      const resetButton = page.getByTestId('forgot-submit');
      if (await resetButton.isVisible()) {
        await resetButton.click();
        const feedbackVisible = await page
          .getByRole('heading', { name: /check your email/i })
          .isVisible()
          .catch(() => false);
        if (!feedbackVisible) {
          logChaosIssue({
            severity: 'medium',
            area: 'auth/forgot-password',
            title: 'Unclear success feedback on password reset submit',
            detail: 'User may not know if email was sent.',
          });
        }
      }
    });

    await test.step('Session edge: direct dashboard nav with manipulated session payload', async () => {
      await page.addInitScript((payload) => {
        window.localStorage.setItem(
          'rails_session',
          JSON.stringify({
            ...payload,
            environments: [{ id: payload.environment_id, type: 'sandbox' }],
          })
        );
      }, e2eSessionWithBothEnvironments());
      await page.goto('/dashboard/identity');
      await expect(page).toHaveURL(/\/dashboard\/identity$/, { timeout: 15_000 });
    });

    await testInfo.attach('ui-flow-chaos-bugs', {
      path: CHAOS_LOG_FILE,
      contentType: 'application/jsonl',
    });
  });
});
