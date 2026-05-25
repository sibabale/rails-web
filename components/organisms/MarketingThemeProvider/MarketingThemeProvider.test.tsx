import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketingThemeProvider, useMarketingTheme } from './MarketingThemeProvider';

function ThemeProbe() {
  const { theme } = useMarketingTheme();
  return <span data-testid="theme-value">{theme}</span>;
}

describe('MarketingThemeProvider', () => {
  it('exposes the default theme to consumers', () => {
    render(
      <MarketingThemeProvider defaultTheme="light">
        <ThemeProbe />
      </MarketingThemeProvider>
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });
});
