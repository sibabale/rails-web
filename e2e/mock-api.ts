import type { BrowserContext, Route } from '@playwright/test';
import { MOCK_API_ORIGIN } from './constants';
import { resetDatabaseMockState, tryHandleDatabaseConnectionsRoute } from './mock-database-state';

export const E2E_SANDBOX_ENV_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const E2E_PROD_ENV_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

const fulfillJson = async (route: Route, body: unknown, status = 200) => {
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }
  await route.fulfill({
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

const emptyPage = (page: number, perPage: number) => ({
  data: [] as unknown[],
  pagination: {
    page,
    per_page: perPage,
    total_count: 0,
    total_pages: 1,
  },
});

const environments = () => [
  { id: E2E_SANDBOX_ENV_ID, type: 'sandbox' },
  { id: E2E_PROD_ENV_ID, type: 'production' },
];

const resolveSelectedEnvironmentId = (requestedId?: string | null) => {
  if (requestedId === E2E_PROD_ENV_ID) {
    return E2E_PROD_ENV_ID;
  }
  return E2E_SANDBOX_ENV_ID;
};

const authSuccessBody = (requestedEnvironmentId?: string | null) => ({
  access_token: 'e2e-access-token',
  refresh_token: 'e2e-refresh-token',
  expires_in: 3600,
  selected_environment_id: resolveSelectedEnvironmentId(requestedEnvironmentId),
  environments: environments(),
});

const meBodyForEnvironment = (environmentId: string | null) => {
  const isProduction = environmentId === E2E_PROD_ENV_ID;
  const envId = isProduction ? E2E_PROD_ENV_ID : E2E_SANDBOX_ENV_ID;
  const envType = isProduction ? 'production' : 'sandbox';

  return {
    user: {
      id: 'user-1',
      name: 'E2E User',
      email: 'e2e@example.com',
      role: 'admin',
      environment_id: envId,
    },
    business: { name: 'E2E Corp', website: 'https://e2e.example.com' },
    environment: {
      id: envId,
      type: envType,
      status: 'active',
    },
  };
};

const readJsonBody = (route: Route): Record<string, unknown> => {
  try {
    return route.request().postDataJSON() as Record<string, unknown>;
  } catch {
    return {};
  }
};

export async function handleMockApi(route: Route) {
  const req = route.request();
  const url = new URL(req.url());
  if (url.origin !== new URL(MOCK_API_ORIGIN).origin) {
    await route.continue();
    return;
  }

  const path = url.pathname;
  const method = req.method();

  if (method === 'POST' && path === '/api/v1/auth/login') {
    const body = readJsonBody(route);
    const requestedEnvironmentId =
      typeof body.environment_id === 'string' ? body.environment_id : null;
    await fulfillJson(route, authSuccessBody(requestedEnvironmentId));
    return;
  }

  if (method === 'POST' && path === '/api/v1/business/register') {
    await fulfillJson(route, authSuccessBody());
    return;
  }

  if (method === 'POST' && path === '/api/v1/auth/password-reset/request') {
    await fulfillJson(route, { message: 'If the email exists, a reset link was sent.' });
    return;
  }

  if (method === 'POST' && path === '/api/v1/auth/password-reset/reset') {
    await fulfillJson(route, { message: 'Password updated.' });
    return;
  }

  if (method === 'POST' && path === '/api/v1/beta/apply') {
    await fulfillJson(route, { message: 'Application received.' });
    return;
  }

  if (method === 'GET' && path === '/api/v1/me') {
    const environmentId = req.headers()['x-environment-id'] ?? null;
    await fulfillJson(route, meBodyForEnvironment(environmentId));
    return;
  }

  if (await tryHandleDatabaseConnectionsRoute(route, fulfillJson)) {
    return;
  }

  if (method === 'GET' && /^\/api\/v1\/accounts\/[^/]+\/transactions$/.test(path)) {
    await fulfillJson(route, []);
    return;
  }

  if (method === 'GET' && /^\/api\/v1\/accounts\/[^/]+$/.test(path)) {
    const id = path.split('/').pop() || 'acc-1';
    await fulfillJson(route, {
      id,
      account_number: '0001',
      account_type: 'checking',
      user_id: 'user-1',
      balance: '0.00',
      currency: 'USD',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    return;
  }

  if (method === 'GET' && path.startsWith('/api/v1/accounts')) {
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = Number(url.searchParams.get('per_page') || '10');
    await fulfillJson(route, emptyPage(page, perPage));
    return;
  }

  if (method === 'GET' && /^\/api\/v1\/transactions\/[^/]+$/.test(path)) {
    await fulfillJson(route, {
      id: 'tx-1',
      organization_id: 'org-1',
      account_id: 'acc-from',
      recipient_account_id: 'acc-to',
      external_recipient_id: '',
      transaction_type: 'transfer',
      amount: 1000,
      balance_after: 1000,
      currency: 'USD',
      status: 'completed',
      description: '',
      reference_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      environment: 'sandbox',
    });
    return;
  }

  if (method === 'GET' && path.startsWith('/api/v1/transactions')) {
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = Number(url.searchParams.get('per_page') || '10');
    await fulfillJson(route, emptyPage(page, perPage));
    return;
  }

  if (method === 'GET' && path.startsWith('/api/v1/ledger/entries')) {
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = Number(url.searchParams.get('per_page') || '10');
    await fulfillJson(route, emptyPage(page, perPage));
    return;
  }

  if (method === 'GET' && path === '/api/v1/api-keys') {
    const environmentId = req.headers()['x-environment-id'] ?? E2E_SANDBOX_ENV_ID;
    await fulfillJson(route, [
      {
        id: `key-${environmentId}`,
        business_id: 'biz-1',
        environment_id: environmentId,
        status: 'active',
        last_used_at: null,
        created_at: new Date().toISOString(),
        revoked_at: null,
        created_by_user_id: 'user-1',
      },
    ]);
    return;
  }

  if (method === 'POST' && path === '/api/v1/api-keys') {
    const environmentId = req.headers()['x-environment-id'] ?? E2E_SANDBOX_ENV_ID;
    await fulfillJson(route, {
      id: `key-new-${environmentId}`,
      key: `rails_test_${environmentId.slice(0, 8)}`,
      status: 'active',
      environment_id: environmentId,
    });
    return;
  }

  if (method === 'POST' && path.includes('/api/v1/api-keys/') && path.endsWith('/revoke')) {
    await fulfillJson(route, { message: 'revoked' });
    return;
  }

  await fulfillJson(
    route,
    {
      error: 'e2e_unmocked_route',
      path,
      method,
    },
    501
  );
}

export async function installApiMocksOnContext(context: BrowserContext) {
  resetDatabaseMockState();
  await context.route(`${MOCK_API_ORIGIN}/**`, handleMockApi);
}

export const e2eSessionWithBothEnvironments = () => ({
  access_token: 'e2e-access-token',
  refresh_token: 'e2e-refresh-token',
  expires_in: 3600,
  timestamp: Date.now(),
  environment_id: E2E_SANDBOX_ENV_ID,
  environments: environments(),
});
