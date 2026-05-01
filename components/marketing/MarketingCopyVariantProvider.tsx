'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDefaultMarketingCopyVariant } from '@/lib/env';
import {
  getMarketingCopyExperimentVariant,
  isAnalyticsEnabled,
  onMarketingCopyFlagsReady,
  registerMarketingCopyVariant,
  trackMarketingCopyExposure,
} from '@/lib/analytics';
import {
  MARKETING_COPY_DEV_STORAGE_KEY,
  MARKETING_COPY_SESSION_KEY,
  parseMarketingCopyVariant,
  type MarketingCopyVariantId,
} from '@/lib/marketingCopyVariant';
import { getMarketingSiteCopy, type MarketingSiteCopy } from '@/lib/marketingSiteCopy';

const FLAG_RESOLVE_TIMEOUT_MS = 4000;

type MarketingCopyContextValue = {
  variant: MarketingCopyVariantId;
  copy: MarketingSiteCopy;
  /** Internal links stay clean; variant is session + PostHog. */
  withCopy: (path: string) => string;
};

const MarketingCopyContext = createContext<MarketingCopyContextValue | null>(null);

function readSessionVariant(): MarketingCopyVariantId | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseMarketingCopyVariant(sessionStorage.getItem(MARKETING_COPY_SESSION_KEY));
  } catch {
    return null;
  }
}

function readDevLocalOverride(): MarketingCopyVariantId | null {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return null;
  try {
    return parseMarketingCopyVariant(localStorage.getItem(MARKETING_COPY_DEV_STORAGE_KEY));
  } catch {
    return null;
  }
}

function persistSessionVariant(v: MarketingCopyVariantId) {
  try {
    sessionStorage.setItem(MARKETING_COPY_SESSION_KEY, v);
  } catch {
    // private mode / quota
  }
}

function buildValue(variant: MarketingCopyVariantId): MarketingCopyContextValue {
  return {
    variant,
    copy: getMarketingSiteCopy(variant),
    withCopy: (path: string) => path,
  };
}

/** Only mounts once `variant` is known — keeps `useMemo` out of the same fiber as the resolving branch. */
function MarketingCopyResolved({
  variant,
  children,
}: {
  variant: MarketingCopyVariantId;
  children: React.ReactNode;
}) {
  const value = useMemo(() => buildValue(variant), [variant]);
  return <MarketingCopyContext.Provider value={value}>{children}</MarketingCopyContext.Provider>;
}

function MarketingCopyVariantInner({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<MarketingCopyVariantId | null>(null);

  useEffect(() => {
    let cancelled = false;
    let finished = false;
    let flagTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubFlags: (() => void) | undefined;

    const finish = (v: MarketingCopyVariantId) => {
      if (finished || cancelled) return;
      finished = true;
      if (flagTimeoutId !== undefined) {
        window.clearTimeout(flagTimeoutId);
        flagTimeoutId = undefined;
      }
      persistSessionVariant(v);
      registerMarketingCopyVariant(v);
      trackMarketingCopyExposure(v);
      setVariant(v);
    };

    const run = () => {
      if (cancelled) return;

      const session = readSessionVariant();
      if (session) {
        registerMarketingCopyVariant(session);
        trackMarketingCopyExposure(session);
        setVariant(session);
        return;
      }

      const dev = readDevLocalOverride();
      if (dev) {
        finish(dev);
        return;
      }

      if (!isAnalyticsEnabled()) {
        finish(getDefaultMarketingCopyVariant());
        return;
      }

      const resolveFromFlags = () => {
        if (finished || cancelled) return;
        const fromFlag = getMarketingCopyExperimentVariant();
        finish(fromFlag ?? getDefaultMarketingCopyVariant());
      };

      const unsub = onMarketingCopyFlagsReady(resolveFromFlags);
      unsubFlags = typeof unsub === 'function' ? unsub : undefined;
      flagTimeoutId = window.setTimeout(resolveFromFlags, FLAG_RESOLVE_TIMEOUT_MS) as unknown as ReturnType<
        typeof setTimeout
      >;
    };

    // Defer until after parent `posthog.init` (same tick’s effects run child-before-parent).
    const deferId = window.setTimeout(run, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(deferId);
      if (flagTimeoutId !== undefined) window.clearTimeout(flagTimeoutId);
      unsubFlags?.();
    };
  }, []);

  if (variant === null) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white dark:bg-black text-zinc-500 dark:text-zinc-400 text-sm"
        data-testid="marketing-copy-resolving"
      >
        <span className="sr-only">Loading</span>
        <span
          aria-hidden
          className="inline-block h-8 w-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-white rounded-full animate-spin"
        />
      </div>
    );
  }

  return <MarketingCopyResolved variant={variant}>{children}</MarketingCopyResolved>;
}

export function MarketingCopyVariantProvider({ children }: { children: React.ReactNode }) {
  return <MarketingCopyVariantInner>{children}</MarketingCopyVariantInner>;
}

export function useMarketingSiteCopy(): MarketingCopyContextValue {
  const ctx = useContext(MarketingCopyContext);
  if (!ctx) {
    throw new Error('useMarketingSiteCopy must be used within MarketingCopyVariantProvider');
  }
  return ctx;
}
