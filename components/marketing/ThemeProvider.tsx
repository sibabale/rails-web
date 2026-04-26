'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type MarketingThemeMode = 'dark' | 'light' | 'system';

type ThemeProviderState = {
  theme: MarketingThemeMode;
  setTheme: (theme: MarketingThemeMode) => void;
};

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

function resolveEffective(mode: MarketingThemeMode): 'light' | 'dark' {
  if (mode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (mode === 'system') return 'dark';
  return mode;
}

function applyDomTheme(mode: MarketingThemeMode) {
  if (typeof document === 'undefined') return;
  const resolved = resolveEffective(mode);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: MarketingThemeMode;
  storageKey?: string;
};

export function MarketingThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<MarketingThemeMode>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey) as MarketingThemeMode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    applyDomTheme(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, mounted, storageKey]);

  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyDomTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mounted, theme]);

  const setTheme = useCallback(
    (next: MarketingThemeMode) => {
      setThemeState(next);
    },
    []
  );

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useMarketingTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useMarketingTheme must be used within MarketingThemeProvider');
  }
  return ctx;
}
