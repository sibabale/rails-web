'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMarketingTheme, type MarketingThemeMode } from '@/components/marketing/ThemeProvider';

export type ThemeMode = 'light' | 'dark';

function resolveEffective(mode: MarketingThemeMode): ThemeMode {
  if (mode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (mode === 'system') return 'dark';
  return mode;
}

/**
 * Resolves marketing theme to light/dark for legacy UI (dashboard, auth footers)
 * and toggles between light and dark (clears system preference on toggle).
 */
export function useTheme() {
  const { theme: mode, setTheme } = useMarketingTheme();
  const [effective, setEffective] = useState<ThemeMode>('dark');

  useEffect(() => {
    setEffective(resolveEffective(mode));
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setEffective(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setTheme(effective === 'dark' ? 'light' : 'dark');
  }, [effective, setTheme]);

  return useMemo(
    () => ({
      theme: effective,
      toggleTheme,
    }),
    [effective, toggleTheme]
  );
}
