import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const baseURL = process.env.LIVE_SITE_URL ?? 'http://127.0.0.1:3000';
const headed = process.env.LIVE_HEADED === '1' || process.env.LIVE_HEADED === 'true';
const slowMo = Number(process.env.LIVE_SLOW_MO ?? (headed ? 400 : 150));

/** Prefer BYOD_* from .env.local (Neon E2E branch); fall back to service URLs in .env. */
const envKeyMap: Record<string, string> = {
  'BYOD_USERS_DATABASE_URL': 'LIVE_DB_USERS_URL',
  'USERS_DATABASE_URL': 'LIVE_DB_USERS_URL',
  'BYOD_ACCOUNTS_DATABASE_URL': 'LIVE_DB_ACCOUNTS_URL',
  'ACCOUNTS_DATABASE_URL': 'LIVE_DB_ACCOUNTS_URL',
  'BYOD_LEDGER_DATABASE_URL': 'LIVE_DB_LEDGER_URL',
  'LEDGER_DATABASE_URL': 'LIVE_DB_LEDGER_URL',
  'BYOD_AUDIT_DATABASE_URL': 'LIVE_DB_AUDIT_URL',
  'AUDIT_DATABASE_URL': 'LIVE_DB_AUDIT_URL',
};

const applyEnvLine = (key: string, value: string): void => {
  const envVar = envKeyMap[key];
  if (envVar) process.env[envVar] = value;
};

export function loadEnvFile(filePath: string, fromLocal = false): void {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    applyEnvLine(key, value);
    if (fromLocal && key === 'BYOD_USERS_DATABASE_URL' && value.trim()) {
      process.env.LIVE_BYOD_USERS_CONFIGURED = '1';
    }
  }
}

export function loadEnterpriseDatabaseUrls(): void {
  const enterpriseDir = path.resolve(configDir, '../rails-enterprise');
  loadEnvFile(path.join(enterpriseDir, '.env'));
  loadEnvFile(path.join(enterpriseDir, '.env.local'), true);
  if (process.env.LIVE_BYOD_USERS_CONFIGURED === '1' && process.env.LIVE_USERS_CONNECT_SOFT_FAIL == null) {
    process.env.LIVE_USERS_CONNECT_SOFT_FAIL = '0';
  }
}

loadEnterpriseDatabaseUrls();

/** Live E2E against running rails-web + rails-client-server + rails-enterprise. No mocks, no webServer. */
export default defineConfig({
  testDir: 'e2e',
  testMatch: ['**/*.live.spec.ts', 'live-database-flows.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 600_000,
  reporter: [['list'], ['json', { outputFile: 'recordings-output/last-run-summary.json' }]],
  outputDir: 'recordings-output',
  use: {
    baseURL,
    video: 'on',
    trace: 'on',
    headless: !headed,
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      slowMo,
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
