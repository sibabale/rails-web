import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ledgerApi, accountsApi, transactionsApi } from '@/lib/api';
import Dashboard from './Dashboard';
import environmentReducer from '@/state/slices/environmentSlice';
import onboardingReducer from '@/state/slices/onboardingSlice';
import migrationsReducer from '@/state/slices/migrationsSlice';

vi.mock('@/components/molecules/DashboardMaterialThemeToggle/DashboardMaterialThemeToggle', () => ({
  DashboardMaterialThemeToggle: () => (
    <button type="button" data-testid="dashboard-theme-toggle-mock" aria-label="Toggle theme">
      theme
    </button>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    accountsApi: {
      ...actual.accountsApi,
      list: vi.fn(),
    },
    transactionsApi: {
      ...actual.transactionsApi,
      list: vi.fn(),
    },
    ledgerApi: {
      ...actual.ledgerApi,
      listEntries: vi.fn(),
    },
  };
});

const renderDashboard = (session: any = null) => {
  const store = configureStore({
    reducer: {
      environment: environmentReducer,
      onboarding: onboardingReducer,
      migrations: migrationsReducer,
    },
  });

  render(
    <Provider store={store}>
      <Dashboard onLogout={() => undefined} session={session} profile={null} />
    </Provider>
  );

  return store;
};

describe('Dashboard environment selector', () => {
  const listAccountsMock = vi.mocked(accountsApi.list);
  const listTransactionsMock = vi.mocked(transactionsApi.list);
  const listEntriesMock = vi.mocked(ledgerApi.listEntries);

  beforeEach(() => {
    listAccountsMock.mockResolvedValue({
      data: [],
      pagination: { page: 1, per_page: 100, total_count: 0, total_pages: 1 },
    });
    listTransactionsMock.mockResolvedValue({
      data: [],
      pagination: { page: 1, per_page: 100, total_count: 0, total_pages: 1 },
    });
    listEntriesMock.mockResolvedValue({
      data: [],
      pagination: { page: 1, per_page: 100, total_count: 0, total_pages: 1 },
    });
  });

  it('defaults to sandbox and switches to production', async () => {
    renderDashboard();
    expect(screen.getAllByText('SANDBOX').length).toBeGreaterThanOrEqual(1);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'PROD' }));

    expect(screen.getByText('PRODUCTION')).toBeInTheDocument();
    expect(
      screen.getByText('Live Production Environment')
    ).toBeInTheDocument();
  });


  it('shows active accounts count in overview', async () => {
    listAccountsMock.mockResolvedValue({
      data: [
        { id: 'acc-1', account_type: 'checking', user_id: 'user-1', currency: 'USD', status: 'active', created_at: new Date().toISOString() },
        { id: 'acc-2', account_type: 'saving', user_id: 'user-1', currency: 'USD', status: 'active', created_at: new Date().toISOString() },
      ],
      pagination: { page: 1, per_page: 100, total_count: 2, total_pages: 1 },
    });

    renderDashboard({
      access_token: 'token',
      environment_id: 'env-1',
      environments: [{ id: 'env-1', type: 'sandbox' }],
    });

    await screen.findByText('Active Accounts');
    await waitFor(
      () => {
        expect(
          within(screen.getByTestId('dashboard-overview-stat-active-accounts')).getByText('2')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('places API key onboarding step above the overview metrics and Rails Platform below both', async () => {
    renderDashboard({
      access_token: 'token',
      environment_id: 'env-1',
      environments: [{ id: 'env-1', type: 'sandbox' }],
    });

    const metrics = await screen.findByTestId('dashboard-overview-stat-active-accounts');
    const apiKeyStep = screen.getByTestId('onboarding-step-apikey');
    const platformHeading = screen.getByText('Rails Platform');

    // Onboarding cards render above the stats tiles
    expect(apiKeyStep.compareDocumentPosition(metrics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Stats tiles render above the Rails Platform section
    expect(metrics.compareDocumentPosition(platformHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('counts completed transactions for the overview tile', async () => {
    listTransactionsMock.mockResolvedValue({
      data: [
        {
          id: 'tx-posted',
          organization_id: 'org-1',
          account_id: 'acc-1',
          recipient_account_id: 'acc-2',
          amount: 1000,
          balance_after: 1000,
          currency: 'USD',
          transaction_type: 'transfer',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'tx-pending',
          organization_id: 'org-1',
          account_id: 'acc-1',
          recipient_account_id: 'acc-2',
          amount: 1000,
          balance_after: 0,
          currency: 'USD',
          transaction_type: 'transfer',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, per_page: 100, total_count: 2, total_pages: 1 },
    });

    renderDashboard({
      access_token: 'token',
      environment_id: 'env-1',
      environments: [{ id: 'env-1', type: 'sandbox' }],
    });

    await screen.findByText('Completed Transactions');
    await waitFor(
      () => {
        expect(
          within(screen.getByTestId('dashboard-overview-stat-completed-transactions')).getByText('1')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('shows settled volume based on account balances in overview', async () => {
    listAccountsMock.mockResolvedValue({
      data: [
        { id: 'acc-1', account_type: 'checking', user_id: 'user-1', balance: 1250.5, currency: 'USD', status: 'active', created_at: new Date().toISOString() },
        { id: 'acc-2', account_type: 'saving', user_id: 'user-1', balance: '249.50', currency: 'USD', status: 'active', created_at: new Date().toISOString() },
      ],
      pagination: { page: 1, per_page: 100, total_count: 2, total_pages: 1 },
    });

    renderDashboard({
      access_token: 'token',
      environment_id: 'env-1',
      environments: [{ id: 'env-1', type: 'sandbox' }],
    });

    await waitFor(
      () => {
        expect(
          within(screen.getByTestId('dashboard-overview-stat-settled-volume')).getByText('$1,500.00')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
