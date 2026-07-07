import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './fixtures';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Category = 'accessibility' | 'usability' | 'copy' | 'responsive' | 'functional';

type AuditIssue = {
  timestamp: string;
  severity: Severity;
  category: Category;
  location: string;
  title: string;
  impact: string;
  recommendation: string;
};

const ARTIFACTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts');
const FLOW_INVENTORY_FILE = path.join(ARTIFACTS_DIR, 'ui-flow-inventory.json');
const BUG_LOG_FILE = path.join(ARTIFACTS_DIR, 'ui-flow-audit-bugs.jsonl');

const FLOW_INVENTORY = [
  {
    id: 'marketing-navigation',
    label: 'Landing + marketing navigation',
    paths: ['/', '/infrastructure', '/use-cases'],
    interactions: ['header links', 'hero CTAs', 'SDK picker', 'section scrolling', 'mobile menu'],
  },
  {
    id: 'auth-journeys',
    label: 'Authentication journeys',
    paths: ['/login', '/forgot-password', '/register'],
    interactions: ['sign in', 'forgot password submit', 'registration submit', 'cross-links'],
  },
  {
    id: 'dashboard-navigation',
    label: 'Dashboard navigation',
    paths: ['/dashboard', '/dashboard/accounts', '/dashboard/transactions', '/dashboard/ledger'],
    interactions: ['sidebar nav', 'identity entry point', 'mobile drawer'],
  },
  {
    id: 'integrations-flow',
    label: 'Integrations flows',
    paths: ['/dashboard/integrations'],
    interactions: ['tabs', 'database connection input', 'show/hide', 'copy', 'connect'],
  },
] as const;

const COPY_PATTERNS: { pattern: RegExp; title: string; impact: string; recommendation: string }[] = [
  {
    pattern: /\b(lorem ipsum|todo|fixme|dummy text)\b/i,
    title: 'Placeholder copy detected',
    impact: 'Users may lose trust when placeholder/internal copy appears in production UI.',
    recommendation: 'Replace placeholder/internal copy with user-facing, task-specific language.',
  },
  {
    pattern: /\bclick here\b/i,
    title: 'Non-descriptive link text detected',
    impact: 'Generic link text reduces clarity and accessibility for screen-reader users.',
    recommendation: 'Use descriptive action labels (for example, “Read API docs”).',
  },
];

test.describe.configure({ mode: 'serial' });

function writeInventory(): void {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(FLOW_INVENTORY_FILE, `${JSON.stringify(FLOW_INVENTORY, null, 2)}\n`);
}

function clearBugLog(): void {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(BUG_LOG_FILE, '');
}

function logIssue(issue: Omit<AuditIssue, 'timestamp'>): void {
  const fullIssue: AuditIssue = {
    timestamp: new Date().toISOString(),
    ...issue,
  };
  fs.appendFileSync(BUG_LOG_FILE, `${JSON.stringify(fullIssue)}\n`);
}

async function logInteractiveSurfaceIssues(page: import('@playwright/test').Page, location: string) {
  const findings = await page.evaluate(() => {
    const issues: Array<{ kind: 'missing-name' | 'small-target'; element: string; detail: string }> = [];
    const seen = new Set<string>();
    const shouldCheckTouchTargets = window.innerWidth <= 768;
    const candidates = document.querySelectorAll<HTMLElement>(
      'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"]'
    );

    candidates.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const inferredLabel = (() => {
        const ariaLabel = el.getAttribute('aria-label')?.trim();
        if (ariaLabel) return ariaLabel;
        const title = el.getAttribute('title')?.trim();
        if (title) return title;
        if (el instanceof HTMLInputElement && el.id) {
          const label = document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`);
          if (label?.textContent?.trim()) return label.textContent.trim();
        }
        return el.textContent?.trim() ?? '';
      })();

      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className ? `.${String(el.className).split(/\s+/).slice(0, 2).join('.')}` : '';
      const elementRef = `${tag}${id}${classes}`;

      if (!inferredLabel) {
        const key = `missing-name:${elementRef}`;
        if (seen.has(key)) return;
        seen.add(key);
        issues.push({
          kind: 'missing-name',
          element: elementRef,
          detail: 'Interactive element has no accessible name.',
        });
      }

      const isPressable =
        tag === 'button' || el.getAttribute('role') === 'button' || (tag === 'a' && el.hasAttribute('href'));
      if (shouldCheckTouchTargets && isPressable && (rect.width < 44 || rect.height < 44)) {
        const key = `small-target:${elementRef}`;
        if (seen.has(key)) return;
        seen.add(key);
        issues.push({
          kind: 'small-target',
          element: elementRef,
          detail: `Touch target is ${Math.round(rect.width)}x${Math.round(rect.height)}.`,
        });
      }
    });

    return issues;
  });

  for (const finding of findings) {
    if (finding.kind === 'missing-name') {
      logIssue({
        severity: 'high',
        category: 'accessibility',
        location,
        title: `Unnamed interactive element: ${finding.element}`,
        impact: 'Screen reader users may not understand or discover this control.',
        recommendation: 'Add a visible label or an aria-label that clearly describes the control action.',
      });
    } else {
      logIssue({
        severity: 'medium',
        category: 'responsive',
        location,
        title: `Small interactive target: ${finding.element}`,
        impact: 'Touch users can miss taps, causing interaction friction on mobile.',
        recommendation: 'Increase target size to at least 44x44px.',
      });
    }
  }
}

async function logCopyIssues(page: import('@playwright/test').Page, location: string) {
  const text = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('pre, code').forEach((node) => node.remove());
    return clone.innerText;
  });
  for (const rule of COPY_PATTERNS) {
    if (rule.pattern.test(text)) {
      logIssue({
        severity: 'medium',
        category: 'copy',
        location,
        title: rule.title,
        impact: rule.impact,
        recommendation: rule.recommendation,
      });
    }
  }
}

test.describe('UI flow investigation and exploratory audit', () => {
  test.beforeAll(() => {
    writeInventory();
    clearBugLog();
    console.log(`[UI-FLOW-AUDIT] Flow inventory: ${FLOW_INVENTORY_FILE}`);
    console.log(`[UI-FLOW-AUDIT] Bug log: ${BUG_LOG_FILE}`);
  });

  test('maps key flows, exercises interactions, and logs audit findings', async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const runId = Date.now();
    const email = `ui-flow-audit+${runId}@example.com`;
    const password = 'Password123!';

    await test.step('Investigate marketing routes and interactions', async () => {
      await page.goto('/');
      await expect(page.getByTestId('marketing-hero-heading')).toBeVisible({ timeout: 20_000 });
      await page.locator('#infrastructure').scrollIntoViewIfNeeded();
      await page.locator('#beta').scrollIntoViewIfNeeded();

      await page.getByRole('link', { name: 'Infrastructure' }).click();
      await expect(page).toHaveURL(/\/infrastructure/);
      await page.getByRole('link', { name: 'Use Cases' }).click();
      await expect(page).toHaveURL(/\/use-cases/);

      await page.goto('/');
      await page.getByTestId('marketing-hero-sdk-toggle').click();
      const sdkOptions = page.locator('[role="option"]');
      const optionCount = await sdkOptions.count();
      await expect(optionCount).toBeGreaterThan(0);
      await sdkOptions.nth(Math.min(1, optionCount - 1)).click();

      await logInteractiveSurfaceIssues(page, '/');
      await logCopyIssues(page, '/');
    });

    await test.step('Audit mobile marketing navigation behavior', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await page.locator('header button:has-text("menu")').first().click();
      await expect(page.getByTestId('marketing-header-documentation-mobile')).toBeVisible();
      await page.locator('header button:has-text("close")').first().click();
      await expect(page.getByTestId('marketing-header-documentation-mobile')).toHaveCount(0);
      await logInteractiveSurfaceIssues(page, '/ (mobile)');
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    await test.step('Run auth flows and transitions', async () => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: /infrastructure auth/i })).toBeVisible();
      await logInteractiveSurfaceIssues(page, '/login');
      await logCopyIssues(page, '/login');

      const button = page.getByRole('button', { name: /forgot security credentials/i });
      if (await button.isVisible()) {
        await button.click();
        await page.waitForURL(/\/forgot-password/, { timeout: 10_000 }).catch(() => undefined);
      }
      await page.getByLabel('Email address').fill(email);
      await page.getByTestId('forgot-submit').click();
      await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible();

      await page.goto('/login');
      const registerButton = page.getByTestId('login-go-register');
      if (await registerButton.isVisible()) {
        await registerButton.click();
        await page.waitForURL(/\/register/, { timeout: 10_000 }).catch(() => {
          // Fallback to direct navigation if button click doesn't navigate
          return page.goto('/register');
        });
      }
      await page.getByLabel('Company Name').fill(`UI Flow Audit ${runId}`);
      await page.getByLabel('Admin First Name').fill('Flow');
      await page.getByLabel('Admin Last Name').fill('Auditor');
      await page.getByLabel('Admin Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByTestId('register-submit').click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    });

    await test.step('Exercise dashboard and integrations click paths', async () => {
      await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
      const dashboardNavPaths = [
        { testId: 'dashboard-nav-overview', path: /\/dashboard$/ },
        { testId: 'dashboard-nav-accounts', path: /\/dashboard\/accounts$/ },
        { testId: 'dashboard-nav-transactions', path: /\/dashboard\/transactions$/ },
        { testId: 'dashboard-nav-ledger', path: /\/dashboard\/ledger$/ },
        { testId: 'dashboard-nav-integrations', path: /\/dashboard\/integrations$/ },
      ] as const;

      for (const nav of dashboardNavPaths) {
        await page.getByTestId(nav.testId).click();
        await expect(page).toHaveURL(nav.path);
      }

      await page.getByTestId('dashboard-nav-identity').click();
      await expect(page).toHaveURL(/\/dashboard\/identity$/);
      await page.getByTestId('dashboard-nav-integrations').click();
      await expect(page).toHaveURL(/\/dashboard\/integrations$/);

      await page.getByRole('tab', { name: 'API Key' }).click();
      await expect(page.getByTestId('api-key-manager')).toBeVisible({ timeout: 15_000 });
      await page.getByRole('tab', { name: 'Databases' }).click();
      await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible();

      const accountsConnection = page.getByRole('textbox', {
        name: /accounts database connection string/i,
      });
      await accountsConnection.fill('postgres://rails:e2e@db.example.com:5432/accounts');
      await page.getByRole('button', { name: /show accounts database connection string/i }).click();
      await page.getByRole('button', { name: /hide accounts database connection string/i }).click();

      const copyButton = page.getByRole('button', {
        name: /copy accounts database connection string/i,
      });
      await copyButton.click();
      const copiedStateVisible = await page
        .getByRole('button', { name: /copied accounts database connection string/i })
        .isVisible()
        .catch(() => false);
      if (!copiedStateVisible) {
        logIssue({
          severity: 'low',
          category: 'usability',
          location: '/dashboard/integrations',
          title: 'Copy action has no visible success confirmation',
          impact: 'Users may be unsure whether the connection string was copied.',
          recommendation: 'Show deterministic success feedback even when clipboard APIs are unavailable.',
        });
      }

      await page.getByTestId('database-connection-save-accounts').click();
      await expect(page.getByTestId('database-connection-connected-accounts')).toBeVisible({
        timeout: 20_000,
      });

      await logInteractiveSurfaceIssues(page, '/dashboard/integrations');
      await logCopyIssues(page, '/dashboard/integrations');
    });

    await test.step('Audit mobile dashboard drawer interactions', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/dashboard');
      await page.getByTestId('dashboard-mobile-menu-open').click();
      await expect(page.getByTestId('dashboard-mobile-menu-backdrop')).toBeVisible();
      await page.getByTestId('dashboard-mobile-menu-close').click();
      await expect(page.getByTestId('dashboard-mobile-menu-backdrop')).toHaveCount(0);
      await logInteractiveSurfaceIssues(page, '/dashboard (mobile)');
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    await testInfo.attach('ui-flow-inventory', {
      path: FLOW_INVENTORY_FILE,
      contentType: 'application/json',
    });
    await testInfo.attach('ui-flow-audit-bugs', {
      path: BUG_LOG_FILE,
      contentType: 'application/jsonl',
    });
  });
});
