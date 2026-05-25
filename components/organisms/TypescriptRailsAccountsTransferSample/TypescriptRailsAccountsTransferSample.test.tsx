import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TypescriptRailsAccountsTransferMarketingHero,
  TypescriptRailsAccountsTransferInfrastructure,
} from './TypescriptRailsAccountsTransferSample';

describe('TypescriptRailsAccountsTransferSample', () => {
  it('renders the marketing hero variant', () => {
    render(<TypescriptRailsAccountsTransferMarketingHero />);
    expect(screen.getByText(/import/i)).toBeInTheDocument();
  });

  it('renders the infrastructure variant', () => {
    render(<TypescriptRailsAccountsTransferInfrastructure />);
    expect(screen.getByText(/import/i)).toBeInTheDocument();
  });
});
