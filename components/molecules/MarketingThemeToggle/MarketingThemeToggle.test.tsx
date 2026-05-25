import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketingThemeProvider } from '@/components/organisms/MarketingThemeProvider/MarketingThemeProvider';
import { MarketingThemeToggle } from './MarketingThemeToggle';

describe('MarketingThemeToggle', () => {
  it('renders inside a theme provider without crashing', () => {
    render(
      <MarketingThemeProvider defaultTheme="dark">
        <MarketingThemeToggle />
      </MarketingThemeProvider>
    );
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
