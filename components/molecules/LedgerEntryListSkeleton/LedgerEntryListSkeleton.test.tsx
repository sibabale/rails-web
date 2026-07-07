import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LedgerEntryListSkeleton from './LedgerEntryListSkeleton';

describe('LedgerEntryListSkeleton', () => {
  it('renders the default test id', () => {
    render(<LedgerEntryListSkeleton />);
    expect(screen.getByTestId('ledger-entry-list-skeleton')).toBeInTheDocument();
  });

  it('honours a custom test id and exposes a status role', () => {
    render(<LedgerEntryListSkeleton rows={2} testId="custom-rows" />);
    const node = screen.getByTestId('custom-rows');
    expect(node).toBeInTheDocument();
    expect(node).toHaveAttribute('role', 'status');
  });
});
