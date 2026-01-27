// API client utilities for Rails services
// Follows existing patterns from App.tsx and LoginPage.tsx

// Removed ApiConfig interface - we only use client-server now

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
  requiresEnvironment?: boolean;
}

interface Session {
  access_token: string;
  environment_id: string;
}

// Get client-server base URL from environment
// All API calls must go through rails-client-server, never directly to services
const getClientServerUrl = (): string => {
  const clientServer = (import.meta.env.VITE_CLIENT_SERVER as string | undefined) || '';
  if (!clientServer) {
    throw new Error('VITE_CLIENT_SERVER is required. All API calls must go through rails-client-server.');
  }
  return clientServer.replace(/\/$/, '');
};

// Make API request with proper headers and error handling
// All requests go through rails-client-server proxy
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  session?: Session | null
): Promise<T> {
  const { method = 'GET', headers = {}, body, requiresAuth = true, requiresEnvironment = true } = options;
  const baseUrl = getClientServerUrl();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  // Add authentication if required
  if (requiresAuth && session?.access_token) {
    requestHeaders.Authorization = `Bearer ${session.access_token}`;
  }

  // Add environment ID if required
  if (requiresEnvironment && session?.environment_id) {
    requestHeaders['X-Environment-Id'] = session.environment_id;
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
      let errorMessage = 'An error occurred while processing your request.';
      
      // Check if response is HTML (like Express default error pages)
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        // Log the HTML error for debugging
        console.error('API returned HTML error page (not shown to user):', errorText.substring(0, 200));
        // Use a generic user-friendly message
        errorMessage = 'The requested resource was not found or is unavailable.';
      } else {
        try {
          const errorJson = JSON.parse(errorText);
          // Prefer user-friendly message from API
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // If response isn't JSON, use generic message
          // Log the actual error for debugging
          console.error('API error response (not shown to user):', errorText);
        }
      }
      throw new Error(errorMessage);
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

export interface Transaction {
  id: string;
  account_id: string;
  amount: string | number;
  currency: string;
  transaction_type: string;
  status: string;
  description?: string;
  created_at: string;
  metadata?: Record<string, string>;
}

export const accountsApi = {
  list: (session: Session | null): Promise<Account[]> =>
    apiRequest<Account[]>('/api/v1/accounts', { method: 'GET' }, session),

  get: (id: string, session: Session | null): Promise<Account> =>
    apiRequest<Account>(`/api/v1/accounts/${id}`, { method: 'GET' }, session),

  getTransactions: (accountId: string, session: Session | null): Promise<Transaction[]> =>
    apiRequest<Transaction[]>(`/api/v1/accounts/${accountId}/transactions`, { method: 'GET' }, session),
};

// Users Service API
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Users Service API
export const usersApi = {
  list: (session: Session | null): Promise<{ users: User[] }> =>
    apiRequest<{ users: User[] }>('/api/v1/users', { method: 'GET' }, session),
  
  get: (id: string, session: Session | null): Promise<User> =>
    apiRequest<User>(`/api/v1/users/${id}`, { method: 'GET' }, session),
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
  listEntries: (session: Session | null, filters?: { account_id?: string }): Promise<{ entries: LedgerEntry[] }> => {
    const params = new URLSearchParams();
    if (filters?.account_id) {
      params.append('account_id', filters.account_id);
    }
    const query = params.toString();
    return apiRequest<{ entries: LedgerEntry[] }>(
      `/api/v1/ledger/entries${query ? `?${query}` : ''}`,
      { method: 'GET' },
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
