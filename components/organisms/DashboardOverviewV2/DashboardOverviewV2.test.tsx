/**
 * DashboardOverviewV2 unit tests — RAI-60
 *
 * Focus: environment-switch state isolation. When the Redux environment changes,
 * connections and hasActiveApiKey must be cleared (null / false) before the
 * re-fetch resolves, so stale data from the previous environment never bleeds
 * into the incoming environment's render.
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardOverviewV2 from './DashboardOverviewV2';
import environmentReducer, { setEnvironment } from '@/state/slices/environmentSlice';
import onboardingReducer, { setOnboardingSnapshot } from '@/state/slices/onboardingSlice';
import { databaseConnectionsApi, apiKeysApi, type DatabaseConnectionsResponse } from '@/lib/api';
import type { Environment } from '@/types';

// ── Dependency mocks ─────────────────────────────────────────────────────────

vi.mock('@/components/molecules/MarketingDocsCtaLink/MarketingDocsCtaLink', () => ({
  MarketingDocsCtaLink: ({ children }: { children: React.ReactNode }) => (
    <a data-testid="docs-cta">{children}</a>
  ),
}));

vi.mock('@/components/organisms/OnboardingStepCard/OnboardingStepCard', () => ({
  default: ({
    title,
    state: stepState,
    testId,
    cta,
  }: {
    title: string;
    state: string;
    testId?: string;
    cta?: React.ReactNode;
  }) => (
    <div data-testid={testId ?? 'onboarding-step'} data-state={stepState}>
      {title}
      {cta}
    </div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    databaseConnectionsApi: {
      ...actual.databaseConnectionsApi,
      list: vi.fn(),
      markFirstRequestSent: vi.fn(),
    },
    apiKeysApi: {
      ...actual.apiKeysApi,
      list: vi.fn(),
    },
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const SANDBOX_ENV_ID = 'aaaa-sandbox';
const PROD_ENV_ID = 'bbbb-production';

const makeSession = (envId = SANDBOX_ENV_ID) => ({
  access_token: 'tok',
  refresh_token: 'ref',
  expires_in: 900,
  environment_id: envId,
  environments: [
    { id: SANDBOX_ENV_ID, type: 'sandbox' as const },
    { id: PROD_ENV_ID, type: 'production' as const },
  ],
});

/**
 * Fully-connected snapshot. Pass `withApiKey: true` to also stamp
 * `api_key_first_created_at` so the API-key onboarding step reads as `complete`.
 */
const connectedSnapshot = (options?: { withApiKey?: boolean }): DatabaseConnectionsResponse => ({
  all_connected: true,
  connections: [
    { service: 'accounts', status: 'connected', last_validated_at: null, updated_at: null },
    { service: 'users', status: 'connected', last_validated_at: null, updated_at: null },
    { service: 'ledger', status: 'connected', last_validated_at: null, updated_at: null },
    { service: 'audit', status: 'connected', last_validated_at: null, updated_at: null },
  ],
  dbs_setup_completed_at: '2026-01-01T00:00:00Z',
  api_key_first_created_at: options?.withApiKey ? '2026-01-02T00:00:00Z' : null,
  first_request_sent_at: null,
});

const emptySnapshot = (): DatabaseConnectionsResponse => ({
  all_connected: false,
  connections: [
    { service: 'accounts', status: 'missing', last_validated_at: null, updated_at: null },
    { service: 'users', status: 'missing', last_validated_at: null, updated_at: null },
    { service: 'ledger', status: 'missing', last_validated_at: null, updated_at: null },
    { service: 'audit', status: 'missing', last_validated_at: null, updated_at: null },
  ],
  dbs_setup_completed_at: null,
  api_key_first_created_at: null,
  first_request_sent_at: null,
});

const makeStore = (initial: Environment = 'sandbox') =>
  configureStore({
    reducer: { environment: environmentReducer, onboarding: onboardingReducer },
    preloadedState: { environment: { current: initial }, onboarding: { byEnvironmentId: {} } },
  });

const renderOverview = (store: ReturnType<typeof makeStore>, session = makeSession()) =>
  render(
    <Provider store={store}>
      <DashboardOverviewV2 session={session} />
    </Provider>
  );

const listMock = databaseConnectionsApi.list as MockedFunction<typeof databaseConnectionsApi.list>;
const markFirstRequestMock = databaseConnectionsApi.markFirstRequestSent as MockedFunction<
  typeof databaseConnectionsApi.markFirstRequestSent
>;
const keysMock = apiKeysApi.list as MockedFunction<typeof apiKeysApi.list>;

// ── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardOverviewV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markFirstRequestMock.mockResolvedValue({ first_request_sent_at: '2026-01-03T00:00:00Z' });
  });

  // ── Initial render ────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the dashboard overview wrapper', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));

      renderOverview(makeStore());
      expect(screen.getByTestId('dashboard-overview-v2')).toBeInTheDocument();
    });

    it('renders the onboarding section', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));

      renderOverview(makeStore());
      expect(screen.getByTestId('dashboard-overview-onboarding')).toBeInTheDocument();
    });

    it('marks all onboarding steps locked while connections is null (snapshot not yet loaded)', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));

      renderOverview(makeStore());
      expect(screen.getByTestId('dashboard-overview-onboarding-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'locked');
      expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'locked');
      expect(screen.getByTestId('onboarding-step-first-request')).toHaveAttribute('data-state', 'locked');
    });

    it('uses cached onboarding state and skips skeleton while live fetch is pending', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));
      const store = makeStore('sandbox');
      store.dispatch(
        setOnboardingSnapshot({
          environmentId: SANDBOX_ENV_ID,
          dbsConnected: true,
          apiKeyGenerated: false,
          firstRequestSent: false,
        })
      );

      renderOverview(store, makeSession(SANDBOX_ENV_ID));
      expect(screen.queryByTestId('dashboard-overview-onboarding-skeleton')).not.toBeInTheDocument();
      expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete');
      expect(screen.getByTestId('dashboard-overview-onboarding')).toHaveAttribute(
        'data-snapshot-loaded',
        'true'
      );
    });

    it('advances dbs step to complete once all four services are connected and milestone is stamped', async () => {
      listMock.mockResolvedValue(connectedSnapshot());
      keysMock.mockResolvedValue([]);

      renderOverview(makeStore());
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );
    });

    it('shows dbs step as active (not locked) when snapshot loaded but connections incomplete', async () => {
      listMock.mockResolvedValue(emptySnapshot());
      keysMock.mockResolvedValue([]);

      renderOverview(makeStore());
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'active')
      );
    });

    it('shows api-key step as active once dbs are complete but no key ever created', async () => {
      // connectedSnapshot() has api_key_first_created_at: null → api-key = active
      listMock.mockResolvedValue(connectedSnapshot());
      keysMock.mockResolvedValue([]);

      renderOverview(makeStore());
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete');
        expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'active');
      });
    });

    it('marks api-key step complete when api_key_first_created_at is stamped in snapshot', async () => {
      // evaluateOnboardingStages uses snapshot.apiKeyFirstCreatedAt (not hasActiveApiKey) for the milestone
      listMock.mockResolvedValue(connectedSnapshot({ withApiKey: true }));
      keysMock.mockResolvedValue([]);

      renderOverview(makeStore());
      await waitFor(() => {
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete');
        expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'complete');
      });
    });

    it('hides onboarding when all steps are complete', async () => {
      listMock.mockResolvedValue({
        ...connectedSnapshot({ withApiKey: true }),
        first_request_sent_at: '2026-01-03T00:00:00Z',
      });
      keysMock.mockResolvedValue([]);

      renderOverview(makeStore());

      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-overview-onboarding')).not.toBeInTheDocument();
      });
    });

    it('renders all three overview metric tiles', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));

      renderOverview(makeStore());
      expect(screen.getByTestId('dashboard-overview-stat-active-accounts')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-overview-stat-completed-transactions')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-overview-stat-settled-volume')).toBeInTheDocument();
    });

    it('renders docs CTA link', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));
      renderOverview(makeStore());
      expect(screen.getByTestId('docs-cta')).toBeInTheDocument();
    });

    it('opens docs in a new tab, persists first-request completion, and hides onboarding once complete', async () => {
      listMock.mockResolvedValue(connectedSnapshot({ withApiKey: true }));
      keysMock.mockResolvedValue([]);
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const store = makeStore('sandbox');

      renderOverview(store, makeSession(SANDBOX_ENV_ID));
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-first-request')).toHaveAttribute(
          'data-state',
          'active'
        )
      );

      await userEvent.click(screen.getByRole('button', { name: 'Open Docs' }));

      expect(windowOpenSpy).toHaveBeenCalledWith('/docs', '_blank', 'noopener,noreferrer');
      await waitFor(() => expect(markFirstRequestMock).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(store.getState().onboarding.byEnvironmentId[SANDBOX_ENV_ID]?.firstRequestSent).toBe(true)
      );
      await waitFor(() =>
        expect(screen.queryByTestId('dashboard-overview-onboarding')).not.toBeInTheDocument()
      );
      windowOpenSpy.mockRestore();
    });

    it('does not call fetch APIs when session is null', () => {
      render(
        <Provider store={makeStore()}>
          <DashboardOverviewV2 session={null} />
        </Provider>
      );
      expect(listMock).not.toHaveBeenCalled();
      expect(keysMock).not.toHaveBeenCalled();
    });
  });

  // ── snapshot-loaded attribute ─────────────────────────────────────────────

  describe('data-snapshot-loaded attribute', () => {
    it('is "false" while fetch is in-flight', () => {
      listMock.mockReturnValue(new Promise(() => {}));
      keysMock.mockReturnValue(new Promise(() => {}));
      renderOverview(makeStore());
      expect(screen.getByTestId('dashboard-overview-onboarding')).toHaveAttribute(
        'data-snapshot-loaded',
        'false'
      );
    });

    it('is "true" after fetch resolves successfully', async () => {
      listMock.mockResolvedValue(emptySnapshot());
      keysMock.mockResolvedValue([]);
      renderOverview(makeStore());
      await waitFor(() =>
        expect(screen.getByTestId('dashboard-overview-onboarding')).toHaveAttribute(
          'data-snapshot-loaded',
          'true'
        )
      );
      expect(screen.queryByTestId('dashboard-overview-onboarding-skeleton')).not.toBeInTheDocument();
    });
  });

  // ── RAI-60: environment-switch state isolation ────────────────────────────

  describe('RAI-60 — environment switch state isolation', () => {
    it('resets connections to null immediately on env change (steps go locked before new fetch lands)', async () => {
      // Sandbox snapshot lands immediately
      listMock.mockResolvedValueOnce(connectedSnapshot());
      keysMock.mockResolvedValueOnce([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      // Wait for sandbox snapshot to be loaded (dbs = complete)
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );

      // Production fetch will never resolve — keeps connections null
      listMock.mockReturnValueOnce(new Promise(() => {}));
      keysMock.mockReturnValueOnce(new Promise(() => {}));

      // Switch to production
      act(() => { store.dispatch(setEnvironment('production')); });

      // With connections reset to null, all steps must be locked before the fetch resolves
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'locked')
      );
      expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'locked');
      expect(screen.getByTestId('onboarding-step-first-request')).toHaveAttribute('data-state', 'locked');
      expect(screen.getByTestId('dashboard-overview-onboarding')).toHaveAttribute(
        'data-snapshot-loaded',
        'false'
      );
    });

    it('shows production empty state (dbs active) after switch completes', async () => {
      listMock.mockResolvedValueOnce(connectedSnapshot());
      keysMock.mockResolvedValueOnce([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );

      // Production fetch resolves with empty state
      listMock.mockResolvedValueOnce(emptySnapshot());
      keysMock.mockResolvedValueOnce([]);

      act(() => { store.dispatch(setEnvironment('production')); });

      // After prod snapshot lands: dbs = active (not all connected), api-key = locked
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'active')
      );
      expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'locked');
    });

    it('restores sandbox connected state when switching back from production', async () => {
      listMock
        .mockResolvedValueOnce(connectedSnapshot())  // sandbox load
        .mockResolvedValueOnce(emptySnapshot())       // → production
        .mockResolvedValueOnce(connectedSnapshot());  // → back to sandbox
      keysMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      // Sandbox → complete
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );

      // → Production (empty → dbs active)
      act(() => { store.dispatch(setEnvironment('production')); });
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'active')
      );

      // → Back to Sandbox (restored → dbs complete)
      act(() => { store.dispatch(setEnvironment('sandbox')); });
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );
    });

    it('shows cached sandbox progress immediately when switching back before refetch resolves', async () => {
      listMock
        .mockResolvedValueOnce(connectedSnapshot()) // initial sandbox load
        .mockResolvedValueOnce(emptySnapshot()) // production load
        .mockReturnValueOnce(new Promise(() => {})); // sandbox refetch hangs
      keysMock.mockResolvedValue([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );

      act(() => {
        store.dispatch(setEnvironment('production'));
      });
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'active')
      );

      act(() => {
        store.dispatch(setEnvironment('sandbox'));
      });
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'complete')
      );
      expect(screen.getByTestId('dashboard-overview-onboarding')).toHaveAttribute(
        'data-snapshot-loaded',
        'true'
      );
      expect(screen.queryByTestId('dashboard-overview-onboarding-skeleton')).not.toBeInTheDocument();
    });

    it('does not carry sandbox api-key-complete flag into production view', async () => {
      // Sandbox has api_key_first_created_at stamped → api-key complete
      listMock
        .mockResolvedValueOnce(connectedSnapshot({ withApiKey: true }))
        .mockResolvedValueOnce(emptySnapshot());
      keysMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      // Sandbox: api-key complete
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'complete')
      );

      // Switch to production — connections resets → api-key must drop to locked
      act(() => { store.dispatch(setEnvironment('production')); });
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'locked')
      );
    });

    it('calls the list APIs a second time after the environment switch', async () => {
      listMock.mockResolvedValue(emptySnapshot());
      keysMock.mockResolvedValue([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

      act(() => { store.dispatch(setEnvironment('production')); });

      await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    });

    it('ignores a stale in-flight sandbox response that arrives after a production switch', async () => {
      let resolveSandboxFetch!: (v: DatabaseConnectionsResponse) => void;
      // Sandbox fetch starts but is held
      listMock.mockReturnValueOnce(
        new Promise((res) => { resolveSandboxFetch = res; })
      );
      keysMock.mockResolvedValueOnce([]);
      // Production fetch resolves immediately with empty state
      listMock.mockResolvedValueOnce(emptySnapshot());
      keysMock.mockResolvedValueOnce([]);

      const store = makeStore('sandbox');
      renderOverview(store, makeSession(SANDBOX_ENV_ID));

      // Switch to production before sandbox fetch completes
      act(() => { store.dispatch(setEnvironment('production')); });

      // Production snapshot lands: dbs = active (empty snapshot)
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'active')
      );

      // Now resolve the stale sandbox fetch — it should be ignored (isActive flag)
      act(() => { resolveSandboxFetch(connectedSnapshot()); });

      // State must remain in production empty state
      await waitFor(() =>
        expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'active')
      );
      expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'locked');
    });
  });

  // ── Network error handling ────────────────────────────────────────────────

  describe('network error handling', () => {
    it('keeps connections null and all steps locked when the fetch rejects', async () => {
      listMock.mockRejectedValue(new Error('network error'));
      keysMock.mockRejectedValue(new Error('network error'));

      renderOverview(makeStore());
      await new Promise((r) => setTimeout(r, 50));
      expect(screen.getByTestId('onboarding-step-dbs')).toHaveAttribute('data-state', 'locked');
      expect(screen.getByTestId('onboarding-step-apikey')).toHaveAttribute('data-state', 'locked');
      expect(screen.getByTestId('onboarding-step-first-request')).toHaveAttribute('data-state', 'locked');
    });

    it('maintains snapshot-loaded as false after a failed fetch', async () => {
      listMock.mockRejectedValue(new Error('network error'));
      keysMock.mockRejectedValue(new Error('network error'));

      renderOverview(makeStore());
      await new Promise((r) => setTimeout(r, 50));
      expect(screen.getByTestId('dashboard-overview-onboarding')).toHaveAttribute(
        'data-snapshot-loaded',
        'false'
      );
    });
  });
});
