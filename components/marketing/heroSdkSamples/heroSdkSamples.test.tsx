import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketingHeroCodeSample } from './heroSdkSamples';

describe('MarketingHeroCodeSample', () => {
  it('renders a TypeScript sample block by default', () => {
    render(<MarketingHeroCodeSample activeSdk="TypeScript" />);
    expect(screen.getByText(/import/i)).toBeInTheDocument();
  });

  it('renders a Go sample block', () => {
    const { container } = render(<MarketingHeroCodeSample activeSdk="Go" />);
    expect(container.textContent).toMatch(/context/i);
    expect(container.textContent).toMatch(/Accounts/);
  });
});
