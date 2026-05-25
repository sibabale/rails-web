import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketingThemeProvider } from '../marketing/ThemeProvider/ThemeProvider';
import { DashboardMaterialThemeToggle } from './DashboardMaterialThemeToggle';

describe('DashboardMaterialThemeToggle', () => {
  it('renders inside a marketing theme provider', () => {
    render(
      <MarketingThemeProvider defaultTheme="dark">
        <DashboardMaterialThemeToggle />
      </MarketingThemeProvider>
    );
    expect(screen.getByTestId('marketing-theme-toggle')).toBeInTheDocument();
  });
});
