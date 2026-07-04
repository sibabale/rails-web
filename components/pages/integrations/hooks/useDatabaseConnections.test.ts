import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseConnectionsApi } from '@/lib/api';
import { DUPLICATE_CONNECTION_NOTICE, displayNameForService } from '@/lib/databaseConnectionSetup';
import { useDatabaseConnections } from './useDatabaseConnections';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    databaseConnectionsApi: {
      list: vi.fn(),
      saveAccountsConnection: vi.fn(),
      saveUsersConnection: vi.fn(),
      saveLedgerConnection: vi.fn(),
      saveAuditConnection: vi.fn(),
      validate: vi.fn(),
      migrations: vi.fn(),
      runMigrations: vi.fn(),
    },
    refreshDatabaseHealth: vi.fn(),
  };
});

vi.mock('@/lib/postConnectIntegrationRefresh', () => ({
  refreshIntegrationStateAfterSave: vi.fn().mockResolvedValue(),
}));

vi.mock('@/lib/databaseSetupState', async () => {
  const actual = await vi.importActual<typeof import('@/lib/databaseSetupState')>(
    '@/lib/databaseSetupState'
  );
  return {
    ...actual,
    isDatabaseSetupCompletedFromBackend: () => false,
    markDatabaseSetupCompleted: vi.fn(),
    readDatabaseSetupCompleted: () => false,
    resolveDbsConnectedOnboardingAction: () => 'no-op' as const,
  };
});

const SERVICE_KEYS = ['accounts', 'users', 'ledger', 'audit'] as const;

const session = {
  access_token: 'test-token',
  environment_id: 'env-sandbox',
  environments: [{ id: 'env-sandbox', type: 'sandbox' }],
};

const emptyListResponse = {
  all_connected: false,
  connections: SERVICE_KEYS.map((service) => ({
    service,
    status: 'missing' as const,
  })),
};

const emptyMigrationResponse = {
  has_pending_updates: false,
  requires_manual_update: false,
  services: SERVICE_KEYS.map((service) => ({
    service,
    connection_status: 'missing' as const,
    pending_count: 0,
    failed_count: 0,
    latest_status: 'not_connected' as const,
  })),
};

const renderHookWithDefaults = () =>
  renderHook(() =>
    useDatabaseConnections({
      session,
      environment: 'sandbox',
      currentEnvironmentId: session.environment_id,
      serviceKeys: SERVICE_KEYS,
      isProductionUnavailable: false,
      updateOnboardingStep: () => {},
    })
  );

const listMock = vi.mocked(databaseConnectionsApi.list);
const migrationsMock = vi.mocked(databaseConnectionsApi.migrations);
const saveAccountsMock = vi.mocked(databaseConnectionsApi.saveAccountsConnection);
const saveUsersMock = vi.mocked(databaseConnectionsApi.saveUsersConnection);
const saveLedgerMock = vi.mocked(databaseConnectionsApi.saveLedgerConnection);
const saveAuditMock = vi.mocked(databaseConnectionsApi.saveAuditConnection);

describe('useDatabaseConnections handleConnect — client-side duplicate guard (RAI-70)', () => {
  beforeEach(() => {
    listMock.mockReset();
    migrationsMock.mockReset();
    saveAccountsMock.mockReset();
    saveUsersMock.mockReset();
    saveLedgerMock.mockReset();
    saveAuditMock.mockReset();
    listMock.mockResolvedValue(emptyListResponse);
    migrationsMock.mockResolvedValue(emptyMigrationResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('surfaces duplicate notice and skips network when client guard fires', async () => {
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    const duplicate = 'postgresql://user:pass@host.example.com:5432/db';
    act(() => {
      result.current.handleChange('accounts', duplicate);
      result.current.handleChange('users', duplicate);
    });

    await act(async () => {
      await result.current.handleConnect('users');
    });

    expect(saveAccountsMock).not.toHaveBeenCalled();
    expect(saveUsersMock).not.toHaveBeenCalled();
    expect(saveLedgerMock).not.toHaveBeenCalled();
    expect(saveAuditMock).not.toHaveBeenCalled();
    expect(result.current.connectionNotices.users).toBe(
      DUPLICATE_CONNECTION_NOTICE(
        displayNameForService('accounts'),
        displayNameForService('users')
      )
    );
    expect(result.current.savingService).toBeNull();
  });

  it('proceeds to network when no duplicate in client snapshot', async () => {
    saveUsersMock.mockResolvedValue({
      service: 'users',
      status: 'connected',
      setup: { migration_status: 'applied', pending_count: 0, applied_count: 1 },
    });
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    act(() => {
      result.current.handleChange('users', 'postgresql://user:pass@host.example.com:5432/db');
    });

    await act(async () => {
      await result.current.handleConnect('users');
    });

    expect(saveUsersMock).toHaveBeenCalledTimes(1);
    expect(result.current.connectionNotices.users).toBeNull();
  });

  it('skips guard on empty candidate — existing validation still fires', async () => {
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    await act(async () => {
      await result.current.handleConnect('users');
    });

    expect(saveAccountsMock).not.toHaveBeenCalled();
    expect(saveUsersMock).not.toHaveBeenCalled();
    expect(saveLedgerMock).not.toHaveBeenCalled();
    expect(saveAuditMock).not.toHaveBeenCalled();
    expect(result.current.connectionNotices.users).toBeNull();
    expect(result.current.error).toBe('Paste a PostgreSQL connection string before connecting.');
  });
});

describe('useDatabaseConnections handleChange — clear-on-edit pathway', () => {
  beforeEach(() => {
    listMock.mockReset();
    migrationsMock.mockReset();
    saveAccountsMock.mockReset();
    saveUsersMock.mockReset();
    saveLedgerMock.mockReset();
    saveAuditMock.mockReset();
    listMock.mockResolvedValue(emptyListResponse);
    migrationsMock.mockResolvedValue(emptyMigrationResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears the connection notice on next edit', async () => {
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    const duplicate = 'postgresql://user:pass@host.example.com:5432/db';
    act(() => {
      result.current.handleChange('accounts', duplicate);
      result.current.handleChange('users', duplicate);
    });
    await act(async () => {
      await result.current.handleConnect('users');
    });
    expect(result.current.connectionNotices.users).not.toBeNull();

    act(() => {
      result.current.handleChange('users', 'postgresql://user:pass@other.example.com:5432/db');
    });
    expect(result.current.connectionNotices.users).toBeNull();
  });
});

describe('useDatabaseConnections handleConnect — backend 409 rendering (RAI-71)', () => {
  beforeEach(() => {
    listMock.mockReset();
    migrationsMock.mockReset();
    saveAccountsMock.mockReset();
    saveUsersMock.mockReset();
    saveLedgerMock.mockReset();
    saveAuditMock.mockReset();
    listMock.mockResolvedValue(emptyListResponse);
    migrationsMock.mockResolvedValue(emptyMigrationResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const buildDuplicateError = () =>
    Object.assign(new Error('This connection string is already in use by another service.'), {
      status: 409,
      body: {
        status: 409,
        message: 'This connection string is already in use by another service.',
        correlationId: 'cid-test',
        timestamp: '2026-07-03T00:00:00.000Z',
      },
    });

  it('routes 409 duplicate into connectionNotices, not setError', async () => {
    saveUsersMock.mockRejectedValue(buildDuplicateError());
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    act(() => {
      result.current.handleChange('users', 'postgresql://user:pass@host.example.com:5432/db');
    });
    await act(async () => {
      await result.current.handleConnect('users');
    });

    expect(result.current.connectionNotices.users).toBe(
      'This connection string is already in use by another service.'
    );
    expect(result.current.error).toBeNull();
  });

  it('clears the 409 duplicate notice on next edit', async () => {
    saveUsersMock.mockRejectedValue(buildDuplicateError());
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    act(() => {
      result.current.handleChange('users', 'postgresql://user:pass@host.example.com:5432/db');
    });
    await act(async () => {
      await result.current.handleConnect('users');
    });
    expect(result.current.connectionNotices.users).not.toBeNull();

    act(() => {
      result.current.handleChange('users', 'postgresql://user:pass@other.example.com:5432/db');
    });
    expect(result.current.connectionNotices.users).toBeNull();
  });

  it('uses the same notice surface for all 409 responses', async () => {
    saveUsersMock.mockRejectedValue(
      Object.assign(new Error('Some other conflict occurred.'), {
        status: 409,
        body: {
          status: 409,
          message: 'Some other conflict occurred.',
          correlationId: 'cid-test',
          timestamp: '2026-07-03T00:00:00.000Z',
        },
      })
    );
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    act(() => {
      result.current.handleChange('users', 'postgresql://user:pass@host.example.com:5432/db');
    });
    await act(async () => {
      await result.current.handleConnect('users');
    });

    expect(result.current.connectionNotices.users).toBe('Some other conflict occurred.');
    expect(result.current.error).toBeNull();
  });
});
