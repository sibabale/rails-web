import { expect, type Page } from '@playwright/test';

export const siteOrigin = process.env.LIVE_SITE_URL ?? 'http://127.0.0.1:3000';
export const livePassword = process.env.LIVE_MOCK_PASSWORD ?? 'SecurePass123!';

export const dbUrls = {
  accounts: process.env.LIVE_DB_ACCOUNTS_URL ?? '',
  users: process.env.LIVE_DB_USERS_URL ?? '',
  ledger: process.env.LIVE_DB_LEDGER_URL ?? '',
  audit: process.env.LIVE_DB_AUDIT_URL ?? '',
};

export const hasLiveDatabaseUrls = (): boolean =>
  Boolean(dbUrls.accounts && dbUrls.users && dbUrls.ledger && dbUrls.audit);

export function freshUserIdentity() {
  const id = process.env.LIVE_RUN_ID ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: process.env.LIVE_MOCK_EMAIL ?? `byod.live.${id}@example.com`,
    company: process.env.LIVE_MOCK_COMPANY ?? `BYOD Live ${id}`,
  };
}

export type RegisteredUser = {
  email: string;
  password: string;
  company: string;
};

/** Registers a fresh business + admin against the real BFF / enterprise stack. */
export async function registerFreshUser(page: Page): Promise<RegisteredUser> {
  const { email, company } = freshUserIdentity();
  const password = livePassword;

  await page.goto(`${siteOrigin}/register`);
  await page.getByLabel('Company Name').fill(company);
  await page.getByLabel('Admin First Name').fill('Live');
  await page.getByLabel('Admin Last Name').fill('Journey');
  await page.getByLabel('Admin Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByTestId('register-submit').click();
  await page.waitForURL(/\/dashboard/, { timeout: 120_000 });

  console.log(`[live-journey] registered ${email}`);
  return { email, password, company };
}

export async function signInUser(page: Page, email: string, password: string) {
  await page.goto(`${siteOrigin}/login`);
  await page.getByPlaceholder('admin@example.com').fill(email);
  await page.getByPlaceholder('••••••••••••').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
}

export async function openIntegrations(page: Page) {
  await page.goto(`${siteOrigin}/dashboard/integrations`);
  await expect(page.getByRole('heading', { name: 'Database Connections' })).toBeVisible({
    timeout: 30_000,
  });
}

export const DATABASE_CARDS = [
  { key: 'accounts' as const, title: 'Accounts Database' },
  { key: 'users' as const, title: 'Users Database' },
  { key: 'ledger' as const, title: 'Ledger Database' },
  { key: 'audit' as const, title: 'Audit Services Database' },
];

export function card(page: Page, title: string) {
  return page.locator('section').filter({
    has: page.getByRole('heading', { name: title }),
  });
}

/** Same DB, different connection string (valid for postgres) — triggers changed-edit path. */
export function variantConnectionString(baseUrl: string, runId: string | number): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}application_name=byod-live-${runId}`;
}
