import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ledgerApi, usersApi, accountsApi, transactionsApi } from '../lib/api';
import Dashboard from '../components/Dashboard';
import environmentReducer from '../state/slices/environmentSlice';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    usersApi: {
      ...actual.usersApi,
      list: vi.fn(),
    },
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
    },
  });

  render(
    <Provider store={store}>
      <Dashboard
        onLogout={() => undefined}
        currentTheme="light"
        onToggleTheme={() => undefined}
        session={session}
        profile={null}
      />
    </Provider>
  );

  return store;
};

describe('Dashboard environment selector', () => {
  const listUsersMock = vi.mocked(usersApi.list);
  const listAccountsMock = vi.mocked(accountsApi.list);
  const listTransactionsMock = vi.mocked(transactionsApi.list);
  const listEntriesMock = vi.mocked(ledgerApi.listEntries);

  beforeEach(() => {
    listUsersMock.mockResolvedValue({
      data: [],
      pagination: { page: 1, per_page: 100, total_count: 0, total_pages: 1 },
    });
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
    expect(screen.getByText('Sandbox')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'PROD' }));

    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(
      screen.getByText('Live Production Environment — Real Assets at Risk')
    ).toBeInTheDocument();
  });


  it('excludes admin users and their accounts from overview stats', async () => {
    listUsersMock.mockResolvedValue({
      data: [
        { id: 'admin-1', first_name: 'Admin', last_name: 'User', email: 'admin@example.com', role: 'admin', status: 'active', created_at: new Date().toISOString() },
        { id: 'user-1', first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', role: 'member', status: 'active', created_at: new Date().toISOString() },
      ],
      pagination: { page: 1, per_page: 100, total_count: 2, total_pages: 1 },
    });

    listAccountsMock.mockResolvedValue({
      data: [
        { id: 'acc-admin', account_type: 'checking', user_id: 'admin-1', currency: 'USD', status: 'active', created_at: new Date().toISOString() },
        { id: 'acc-user', account_type: 'checking', user_id: 'user-1', currency: 'USD', status: 'active', created_at: new Date().toISOString() },
      ],
      pagination: { page: 1, per_page: 100, total_count: 2, total_pages: 1 },
    });

    renderDashboard({
      access_token: 'token',
      environment_id: 'env-1',
      environments: [{ id: 'env-1', type: 'sandbox' }],
    });

    const usersCard = await screen.findByText('Active Users');
    await waitFor(() => {
      expect(within(usersCard.closest('div') as HTMLElement).getByText('1')).toBeInTheDocument();
    });

    const accountsCard = screen.getByText('Active Accounts');
    await waitFor(() => {
      expect(within(accountsCard.closest('div') as HTMLElement).getByText('1')).toBeInTheDocument();
    });
  });

  it('counts posted transactions for the overview tile', async () => {
    listTransactionsMock.mockResolvedValue({
      data: [
        {
          id: 'tx-posted',
          organization_id: 'org-1',
          from_account_id: 'acc-1',
          to_account_id: 'acc-2',
          amount: 1000,
          currency: 'USD',
          transaction_kind: 'transfer',
          status: 'posted',
          idempotency_key: 'key-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'tx-pending',
          organization_id: 'org-1',
          from_account_id: 'acc-1',
          to_account_id: 'acc-2',
          amount: 1000,
          currency: 'USD',
          transaction_kind: 'transfer',
          status: 'pending',
          idempotency_key: 'key-2',
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

    const postedCard = await screen.findByText('Posted Transactions');
    await waitFor(() => {
      expect(within(postedCard.closest('div') as HTMLElement).getByText('1')).toBeInTheDocument();
    });
  });
});
