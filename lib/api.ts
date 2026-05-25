// API client utilities for Rails services
// Follows existing patterns from App.tsx and LoginPage.tsx

// Removed ApiConfig interface - we only use client-server now

import type { Environment } from '../state/slices/environmentSlice';
import { getClientServerUrl } from './env';
import { resolveEnvironmentId } from './environment';
import { ApiRequestError } from './apiRequestError';
import { getStoreState } from '../state/store';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
  requiresEnvironment?: boolean;
  environment?: Environment; // Optional: if not provided, will be read from Redux store
}

export interface EnvironmentInfo {
  id: string;
  type: string;
}

interface Session {
  access_token: string;
  environment_id: string;
  environments?: EnvironmentInfo[]; // All available environments for the business
}

// Get client-server base URL from environment
// All API calls must go through rails-client-server, never directly to services
const getClientServerBaseUrl = (): string => {
  const clientServer = getClientServerUrl();
  if (!clientServer) {
    throw new Error('NEXT_PUBLIC_CLIENT_SERVER is required. All API calls must go through rails-client-server.');
  }
  return clientServer.replace(/\/$/, '');
};

/** Best-effort message from JSON error bodies (BFF, Rails, Axum shapes). */
function pickErrorMessageFromJson(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null);
  const fromMessage = str(o.message) ?? str(o.detail) ?? str(o.title);
  if (fromMessage) return fromMessage;
  if (typeof o.error === 'string') return str(o.error);
  if (o.error && typeof o.error === 'object') {
    const inner = o.error as Record<string, unknown>;
    const nested = str(inner.message) ?? str(inner.detail);
    if (nested) return nested;
  }
  const errs = o.errors;
  if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
    const entries = Object.entries(errs as Record<string, unknown>);
    if (entries.length) {
      const [k, v] = entries[0];
      if (Array.isArray(v) && typeof v[0] === 'string') return `${k}: ${v[0]}`;
      if (typeof v === 'string') return `${k}: ${v}`;
    }
  }
  return null;
}

// Make API request with proper headers and error handling
// All requests go through rails-client-server proxy
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  session?: Session | null
): Promise<T> {
  const { method = 'GET', headers = {}, body, requiresAuth = true, requiresEnvironment = true, environment } = options;
  const baseUrl = getClientServerBaseUrl();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  // Add authentication if required
  if (requiresAuth && session?.access_token) {
    requestHeaders.Authorization = `Bearer ${session.access_token}`;
  }

  // Add X-Environment header (sandbox/production) - REQUIRED for all services
  // Priority: explicit parameter > Redux store > default to sandbox (safety)
  const currentEnvironment: Environment = environment || getStoreState().environment.current || 'sandbox';
  requestHeaders['X-Environment'] = currentEnvironment;

  // Add environment ID if required (for Users/Accounts services)
  if (requiresEnvironment && session) {
    const environmentId = resolveEnvironmentId(session, currentEnvironment);
    if (environmentId) {
      requestHeaders['X-Environment-Id'] = environmentId;
    }
  }

  // Add correlation ID for request tracking
  const correlationId = crypto.randomUUID();
  requestHeaders['X-Correlation-Id'] = correlationId;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      let errorMessage = 'An error occurred while processing your request.';

      // Check if response is HTML (like Express default error pages)
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        // Log the HTML error for debugging
        console.error('API returned HTML error page (not shown to user):', errorText.substring(0, 200));
        // Use a generic user-friendly message
        errorMessage = 'The requested resource was not found or is unavailable.';
      } else {
        try {
          const errorJson = JSON.parse(errorText) as unknown;
          errorMessage = pickErrorMessageFromJson(errorJson) ?? errorMessage;
        } catch {
          const t = errorText.trim();
          if (t.length > 0 && t.length < 400 && !t.includes('<')) {
            errorMessage = t;
          } else {
            console.error('API error response (not shown to user):', errorText.substring(0, 500));
          }
        }
      }
      if (errorMessage === 'An error occurred while processing your request.') {
        errorMessage = `Request failed (HTTP ${status}).`;
      }
      throw new ApiRequestError(errorMessage, {
        status,
        path,
        correlationId,
      });
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return (await response.text()) as T;
  } catch (error) {
    if (error instanceof Error) {
      // If it's already a user-friendly error message, pass it through
      throw error;
    }
    // Generic network error message
    throw new Error('Unable to connect to the service. Please check your connection and try again.');
  }
}

// Accounts Service API
export interface Account {
  id: string;
  account_number?: string;
  account_type: string;
  user_id?: string;
  balance?: string | number;
  currency: string;
  status: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, string>;
}

/** Accounts-service transaction (list/detail) — amounts in minor units (e.g. cents). */
export interface Transaction {
  id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  description?: string;
  external_recipient_id?: string;
  recipient_account_id?: string;
  reference_id?: string;
  /** Included on some responses only */
  organization_id?: string;
  failure_reason?: string | null;
  idempotency_key?: string;
  environment?: string | null;
}

export const accountsApi = {
  list: (session: Session | null, page?: number, perPage?: number): Promise<PaginatedResponse<Account>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (perPage) params.append('per_page', String(perPage));
    const query = params.toString();
    return apiRequest<PaginatedResponse<Account>>(
      `/api/v1/accounts${query ? `?${query}` : ''}`,
      { method: 'GET' },
      session
    );
  },

  get: (id: string, session: Session | null): Promise<Account> =>
    apiRequest<Account>(`/api/v1/accounts/${id}`, { method: 'GET' }, session),

  getTransactions: (accountId: string, session: Session | null): Promise<Transaction[]> =>
    apiRequest<Transaction[]>(`/api/v1/accounts/${accountId}/transactions`, { method: 'GET' }, session),
};

// Transactions Service API
export const transactionsApi = {
  list: (session: Session | null, page?: number, perPage?: number): Promise<PaginatedResponse<Transaction>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (perPage) params.append('per_page', String(perPage));
    const query = params.toString();
    return apiRequest<PaginatedResponse<Transaction>>(
      `/api/v1/transactions${query ? `?${query}` : ''}`,
      { method: 'GET' },
      session
    );
  },
  
  get: (id: string, session: Session | null): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/v1/transactions/${id}`, { method: 'GET' }, session),
};

export type DatabaseConnectionService = 'accounts' | 'users' | 'ledger' | 'audit';

export interface DatabaseConnectionSetupResult {
  migration_status: string;
  pending_count: number;
  applied_count: number;
  error?: string | null;
  message?: string | null;
}

export interface DatabaseConnectionInfo {
  service: DatabaseConnectionService;
  status: 'connected' | 'invalid' | 'missing';
  last_validated_at?: string | null;
  updated_at?: string | null;
  setup?: DatabaseConnectionSetupResult | null;
  unchanged?: boolean;
}

export interface DatabaseConnectionsResponse {
  /** Live, demotable view: every required service in `connections` is currently `connected`. */
  all_connected: boolean;
  connections: DatabaseConnectionInfo[];
  /** Write-once milestone: first time all four services reached the onboarding bar. Never cleared. */
  dbs_setup_completed_at?: string | null;
  /** Write-once milestone: first-ever API key creation timestamp for the environment. Never cleared. */
  api_key_first_created_at?: string | null;
}

export interface DatabaseConnectionMigrationInfo {
  service: DatabaseConnectionService;
  connection_status?: 'connected' | 'invalid' | 'missing' | string;
  pending_count: number;
  failed_count: number;
  latest_version?: string | null;
  latest_status?: 'not_connected' | 'not_checked' | 'pending' | 'running' | 'applied' | 'failed' | string | null;
  latest_updated_at?: string | null;
}

export interface DatabaseConnectionMigrationStatusResponse {
  has_pending_updates: boolean;
  requires_manual_update: boolean;
  services: DatabaseConnectionMigrationInfo[];
  dbs_setup_completed_at?: string | null;
}

export interface DatabaseConnectionMigrationRunInfo {
  service: DatabaseConnectionService;
  status: 'applied' | 'failed' | 'skipped' | string;
  pending_count: number;
  applied_count: number;
  error?: string | null;
}

export interface DatabaseConnectionMigrationRunResponse {
  has_failures: boolean;
  services: DatabaseConnectionMigrationRunInfo[];
}

export const databaseConnectionsApi = {
  list: (session: Session | null): Promise<DatabaseConnectionsResponse> =>
    apiRequest<DatabaseConnectionsResponse>('/api/v1/database-connections', { method: 'GET' }, session),

  save: (
    session: Session | null,
    service: DatabaseConnectionService,
    connectionString: string
  ): Promise<DatabaseConnectionInfo> =>
    apiRequest<DatabaseConnectionInfo>(
      '/api/v1/database-connections',
      {
        method: 'POST',
        body: { service, connection_string: connectionString },
      },
      session
    ),

  validate: (session: Session | null): Promise<DatabaseConnectionsResponse> =>
    apiRequest<DatabaseConnectionsResponse>(
      '/api/v1/database-connections/validate',
      { method: 'POST', body: {} },
      session
    ),

  migrations: (session: Session | null): Promise<DatabaseConnectionMigrationStatusResponse> =>
    apiRequest<DatabaseConnectionMigrationStatusResponse>(
      '/api/v1/database-connections/migrations',
      { method: 'GET' },
      session
    ),

  runMigrations: (session: Session | null): Promise<DatabaseConnectionMigrationRunResponse> =>
    apiRequest<DatabaseConnectionMigrationRunResponse>(
      '/api/v1/database-connections/migrations/run',
      { method: 'POST', body: {} },
      session
    ),
};

export async function refreshDatabaseHealth(session: Session): Promise<{
  summary: DatabaseConnectionsResponse;
  migrations: DatabaseConnectionMigrationStatusResponse;
}> {
  const summary = await databaseConnectionsApi.validate(session);
  const migrations = await databaseConnectionsApi.migrations(session);
  return { summary, migrations };
}

export interface ApiKeyInfo {
  id: string;
  business_id: string;
  environment_id: string | null;
  status: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
  created_by_user_id: string | null;
}

export const apiKeysApi = {
  list: (session: Session | null): Promise<ApiKeyInfo[]> =>
    apiRequest<ApiKeyInfo[]>('/api/v1/api-keys', { method: 'GET' }, session),
};

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Password Reset API
export interface RequestPasswordResetResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const passwordResetApi = {
  request: (email: string): Promise<RequestPasswordResetResponse> => {
    return apiRequest<RequestPasswordResetResponse>(
      '/api/v1/auth/password-reset/request',
      {
        method: 'POST',
        body: { email },
        requiresAuth: false,
        requiresEnvironment: false,
      },
      null
    );
  },

  reset: (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    return apiRequest<ResetPasswordResponse>(
      '/api/v1/auth/password-reset/reset',
      {
        method: 'POST',
        body: { token, new_password: newPassword },
        requiresAuth: false,
        requiresEnvironment: false,
      },
      null
    );
  },
};

// Beta application API (unauthenticated)
export interface BetaApplicationPayload {
  name: string;
  email: string;
  company: string;
  use_case: string;
}

export interface BetaApplicationResponse {
  message: string;
}

export const betaApplyApi = {
  apply: (payload: BetaApplicationPayload): Promise<BetaApplicationResponse> =>
    apiRequest<BetaApplicationResponse>(
      '/api/v1/beta/apply',
      {
        method: 'POST',
        body: payload,
        requiresAuth: false,
        requiresEnvironment: false,
      },
      null
    ),
};

// Ledger Service API
export interface LedgerEntry {
  id: string;
  ledger_account_id: string;
  external_account_id?: string;
  transaction_id: string;
  external_transaction_id?: string;
  entry_type: 'debit' | 'credit';
  amount: string | number;
  currency: string;
  created_at: string;
}

export interface LedgerTransaction {
  id: string;
  organization_id: string;
  environment: string;
  external_transaction_id: string;
  status: 'pending' | 'posted' | 'failed';
  idempotency_key: string;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;
  entries?: LedgerEntry[];
}

// Ledger Service API - REST endpoints now available
export const ledgerApi = {
  listEntries: (
    session: Session | null,
    filters?: { account_id?: string },
    page?: number,
    perPage?: number,
    environment?: Environment
  ): Promise<PaginatedResponse<LedgerEntry>> => {
    const params = new URLSearchParams();
    if (filters?.account_id) {
      params.append('account_id', filters.account_id);
    }
    if (page) params.append('page', String(page));
    if (perPage) params.append('per_page', String(perPage));
    const query = params.toString();
    return apiRequest<PaginatedResponse<LedgerEntry>>(
      `/api/v1/ledger/entries${query ? `?${query}` : ''}`,
      { method: 'GET', ...(environment ? { environment } : {}) },
      session
    );
  },
  
  listTransactions: (session: Session | null, filters?: { status?: string }): Promise<{ transactions: LedgerTransaction[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    const query = params.toString();
    return apiRequest<{ transactions: LedgerTransaction[] }>(
      `/api/v1/ledger/transactions${query ? `?${query}` : ''}`,
      { method: 'GET' },
      session
    );
  },
  
  getTransaction: (id: string, session: Session | null): Promise<LedgerTransaction> =>
    apiRequest<LedgerTransaction>(`/api/v1/ledger/transactions/${id}`, { method: 'GET' }, session),
};
