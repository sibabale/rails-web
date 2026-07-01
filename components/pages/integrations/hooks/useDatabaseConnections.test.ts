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
      save: vi.fn(),
      validate: vi.fn(),
      migrations: vi.fn(),
      runMigrations: vi.fn(),
    },
    refreshDatabaseHealth: vi.fn(),
  };
});

vi.mock('@/lib/postConnectIntegrationRefresh', () => ({
  refreshIntegrationStateAfterSave: vi.fn().mockResolvedValue(undefined),
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

const renderHookWithDefaults = () =>
  renderHook(() =>
    useDatabaseConnections({
      session,
      environment: 'sandbox',
      currentEnvironmentId: session.environment_id,
      serviceKeys: SERVICE_KEYS,
      isProductionUnavailable: false,
      updateOnboardingStep: () => undefined,
    })
  );

const listMock = vi.mocked(databaseConnectionsApi.list);
const saveMock = vi.mocked(databaseConnectionsApi.save);

describe('useDatabaseConnections handleConnect — client-side duplicate guard (RAI-70)', () => {
  beforeEach(() => {
    listMock.mockReset();
    saveMock.mockReset();
    listMock.mockResolvedValue(emptyListResponse);
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

    expect(saveMock).not.toHaveBeenCalled();
    expect(result.current.connectionNotices.users).toBe(
      DUPLICATE_CONNECTION_NOTICE(
        displayNameForService('accounts'),
        displayNameForService('users')
      )
    );
    expect(result.current.savingService).toBeNull();
  });

  it('proceeds to network when no duplicate in client snapshot', async () => {
    saveMock.mockResolvedValue({
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

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(result.current.connectionNotices.users).toBeNull();
  });

  it('skips guard on empty candidate — existing validation still fires', async () => {
    const { result } = renderHookWithDefaults();
    await waitFor(() => expect(result.current.initialCheckComplete).toBe(true));

    await act(async () => {
      await result.current.handleConnect('users');
    });

    expect(saveMock).not.toHaveBeenCalled();
    expect(result.current.connectionNotices.users).toBeNull();
    expect(result.current.error).toBe('Paste a PostgreSQL connection string before connecting.');
  });
});
