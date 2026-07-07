'use client';

import React from 'react';
import { useMarketingTheme } from '@/components/organisms/MarketingThemeProvider/MarketingThemeProvider';

/** Theme control for dashboard (Material Symbols Sharp — matches protected chrome). */
export function DashboardMaterialThemeToggle() {
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
      className="p-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
      title="Toggle theme"
    >
      {theme === 'light' && (
        <span className="material-symbols-sharp block !text-[1rem] leading-none" aria-hidden>
          light_mode
        </span>
      )}
      {theme === 'dark' && (
        <span className="material-symbols-sharp block !text-[1rem] leading-none" aria-hidden>
          dark_mode
        </span>
      )}
      {theme === 'system' && (
        <span className="material-symbols-sharp block !text-[1rem] leading-none" aria-hidden>
          desktop_windows
        </span>
      )}
    </button>
  );
}
