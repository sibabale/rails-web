import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ledgerApi } from '../lib/api';
import SettledVolumeChart from '../components/SettledVolumeChart';
import { vi } from 'vitest';

describe('SettledVolumeChart', () => {
  it('renders bars and tooltip amounts', () => {
    vi.spyOn(ledgerApi, 'listEntries').mockResolvedValue({
      data: [
        { id: 'entry-1', ledger_account_id: 'acc-1', transaction_id: 'tx-1', entry_type: 'credit', amount: 1234.5, currency: 'USD', created_at: '2026-01-01T10:00:00Z' },
        { id: 'entry-2', ledger_account_id: 'acc-2', transaction_id: 'tx-2', entry_type: 'debit', amount: 250, currency: 'USD', created_at: '2026-01-02T10:00:00Z' },
      ],
      pagination: { page: 1, per_page: 100, total_count: 2, total_pages: 1 },
    });

    render(
      <SettledVolumeChart
        session={{ access_token: 'token', environment_id: 'env-1' }}
        range="ALL"
      />
    );

    expect(screen.getByTestId('settled-volume-chart-loader')).toBeInTheDocument();
    expect(await screen.findByTestId('settled-volume-chart')).toBeInTheDocument();
  });
});
