'use client';

import React, { createContext, useContext, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDefaultMarketingCopyVariant } from '@/lib/env';
import { appendMarketingCopyParam, parseMarketingCopyVariant, type MarketingCopyVariantId } from '@/lib/marketingCopyVariant';
import { getMarketingSiteCopy, type MarketingSiteCopy } from '@/lib/marketingSiteCopy';
import { trackMarketingCopyExposure } from '@/lib/analytics';

const STORAGE_KEY = 'rails_marketing_copy_variant';

type MarketingCopyContextValue = {
  variant: MarketingCopyVariantId;
  copy: MarketingSiteCopy;
  /** Append `?copy=` / `&copy=` so navigation keeps the active marketing variant. */
  withCopy: (path: string) => string;
};

const MarketingCopyContext = createContext<MarketingCopyContextValue | null>(null);

function resolveVariant(searchParams: ReturnType<typeof useSearchParams>): MarketingCopyVariantId {
  const fromQuery = parseMarketingCopyVariant(searchParams.get('copy'));
  if (fromQuery) return fromQuery;
  if (typeof window !== 'undefined') {
    const stored = parseMarketingCopyVariant(sessionStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  }
  return getDefaultMarketingCopyVariant();
}

function persistVariantFromQuery(searchParams: ReturnType<typeof useSearchParams>) {
  const fromQuery = parseMarketingCopyVariant(searchParams.get('copy'));
  if (fromQuery && typeof window !== 'undefined') sessionStorage.setItem(STORAGE_KEY, fromQuery);
}

function buildValue(variant: MarketingCopyVariantId): MarketingCopyContextValue {
  return {
    variant,
    copy: getMarketingSiteCopy(variant),
    withCopy: (path: string) => appendMarketingCopyParam(path, variant),
  };
}

function MarketingCopyVariantInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    persistVariantFromQuery(searchParams);
  }, [searchParams]);
  const variant = useMemo(() => resolveVariant(searchParams), [searchParams]);
  const value = useMemo(() => buildValue(variant), [variant]);

  useEffect(() => {
    trackMarketingCopyExposure(variant);
  }, [variant]);

  return <MarketingCopyContext.Provider value={value}>{children}</MarketingCopyContext.Provider>;
}

function MarketingCopyVariantFallback({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => buildValue(getDefaultMarketingCopyVariant()), []);
  return <MarketingCopyContext.Provider value={value}>{children}</MarketingCopyContext.Provider>;
}

export function MarketingCopyVariantProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<MarketingCopyVariantFallback>{children}</MarketingCopyVariantFallback>}>
      <MarketingCopyVariantInner>{children}</MarketingCopyVariantInner>
    </Suspense>
  );
}

export function useMarketingSiteCopy(): MarketingCopyContextValue {
  const ctx = useContext(MarketingCopyContext);
  if (!ctx) {
    throw new Error('useMarketingSiteCopy must be used within MarketingCopyVariantProvider');
  }
  return ctx;
}
