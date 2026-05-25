import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LedgerSummarySkeleton from './LedgerSummarySkeleton';

describe('LedgerSummarySkeleton', () => {
  it('renders the default test id', () => {
    render(<LedgerSummarySkeleton />);
    expect(screen.getByTestId('ledger-summary-skeleton')).toBeInTheDocument();
  });

  it('honours a custom test id and exposes a status role', () => {
    render(<LedgerSummarySkeleton testId="custom-summary" />);
    const node = screen.getByTestId('custom-summary');
    expect(node).toBeInTheDocument();
    expect(node).toHaveAttribute('role', 'status');
  });
});
