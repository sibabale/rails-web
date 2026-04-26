'use client';

import React from 'react';
import { useMarketingTheme } from './ThemeProvider';

export function MarketingThemeToggle() {
  const { theme, setTheme } = useMarketingTheme();

  return (
    <button
      type="button"
      data-testid="marketing-theme-toggle"
      onClick={() => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
      }}
      className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      title="Toggle theme"
    >
      {theme === 'light' && (
        <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
          light_mode
        </span>
      )}
      {theme === 'dark' && (
        <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
          dark_mode
        </span>
      )}
      {theme === 'system' && (
        <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
          desktop_windows
        </span>
      )}
    </button>
  );
}
