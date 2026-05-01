'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { MARKETING_SITE_COPY, type MarketingSiteCopy } from '@/lib/marketingSiteCopy';

type MarketingCopyContextValue = {
  copy: MarketingSiteCopy;
  /** Internal links stay clean (reserved for future use). */
  withCopy: (path: string) => string;
};

const MarketingCopyContext = createContext<MarketingCopyContextValue | null>(null);

export function MarketingCopyVariantProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<MarketingCopyContextValue>(
    () => ({
      copy: MARKETING_SITE_COPY,
      withCopy: (path: string) => path,
    }),
    []
  );
  return <MarketingCopyContext.Provider value={value}>{children}</MarketingCopyContext.Provider>;
}

export function useMarketingSiteCopy(): MarketingCopyContextValue {
  const ctx = useContext(MarketingCopyContext);
  if (!ctx) {
    throw new Error('useMarketingSiteCopy must be used within MarketingCopyVariantProvider');
  }
  return ctx;
}
