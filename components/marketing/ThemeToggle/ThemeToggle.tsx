'use client';

import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useMarketingTheme } from '../ThemeProvider/ThemeProvider';

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
      {theme === 'light' && <Sun className="size-4" strokeWidth={2} aria-hidden />}
      {theme === 'dark' && <Moon className="size-4" strokeWidth={2} aria-hidden />}
      {theme === 'system' && <Monitor className="size-4" strokeWidth={2} aria-hidden />}
    </button>
  );
}
