import posthog from 'posthog-js';
import {
  getPostHogHostEnv,
  getPostHogKeyEnv,
  getPostHogMarketingCopyFlagKey,
  isAnalyticsExplicitlyDisabled,
} from './env';
import type { MarketingCopyVariantId } from './marketingCopyVariant';

const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

const IS_DEV = process.env.NODE_ENV !== 'production';

const POSTHOG_KEY =
  getPostHogKeyEnv();
const POSTHOG_HOST = getPostHogHostEnv() || DEFAULT_POSTHOG_HOST;

let landingTrackingInitialized = false;

/**
 * Analytics is enabled when a PostHog key is set, unless analytics is explicitly disabled.
 * Key/host values are read from Next public env vars at build/runtime.
 */
export const isAnalyticsEnabled = () => {
  if (!POSTHOG_KEY) return false;
  if (isAnalyticsExplicitlyDisabled()) return false;
  return true;
};

export const getPostHogKey = () => POSTHOG_KEY;

export const getMarketingCopyFeatureFlagKey = () => getPostHogMarketingCopyFlagKey();

const normalizeMultivariateFlag = (value: unknown): MarketingCopyVariantId | null => {
  if (value === 'a' || value === 'd') return value;
  // PostHog Experiments require a multivariate key named `control`; we treat it as copy variant A.
  if (value === 'control') return 'a';
  return null;
};

/**
 * Reads the PostHog multivariate payload for the marketing copy experiment.
 * Call after flags have loaded (e.g. inside `onMarketingCopyFlagsReady`).
 */
export const getMarketingCopyExperimentVariant = (): MarketingCopyVariantId | null => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return null;
  const raw = posthog.getFeatureFlag(getMarketingCopyFeatureFlagKey());
  return normalizeMultivariateFlag(raw);
};

/**
 * Runs `callback` when feature flags are ready (or immediately if disabled / not in browser).
 * Returns an unsubscribe function when PostHog is enabled.
 */
export const onMarketingCopyFlagsReady = (callback: () => void): (() => void) | void => {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsEnabled()) {
    callback();
    return;
  }
  return posthog.onFeatureFlags(callback);
};

/** Attach variant to subsequent PostHog events (super properties). */
export const registerMarketingCopyVariant = (variant: MarketingCopyVariantId) => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return;
  posthog.register({ marketing_copy_variant: variant });
};

/**
 * Options for posthog.init(). Passed when initializing before render (index) so capture is safe from first frame.
 */
export const getPostHogOptions = () => ({
  api_host: POSTHOG_HOST,
  person_profiles: 'identified_only' as const,
  capture_pageview: false,
  capture_pageleave: true,
  cross_subdomain_cookie: false,
  persistence: 'localStorage' as const,
  autocapture: false,
  ...(IS_DEV && { debug: true }),
});

export const trackEvent = (eventName: string, properties: Record<string, unknown> = {}) => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return;

  posthog.capture(eventName, {
    ...properties,
    timestamp: Date.now(),
    url: window.location.href,
    user_agent: navigator.userAgent,
  });
};

/** Fires when marketing copy variant is active (for A/B analysis). Dedupes repeats of the same variant in-session. */
export const trackMarketingCopyExposure = (variant: 'a' | 'd') => {
  if (typeof window === 'undefined') return;
  const key = `rails_mkt_copy_exposure_${variant}`;
  if (sessionStorage.getItem(key) === '1') return;
  sessionStorage.setItem(key, '1');
  trackEvent('marketing_copy_exposure', {
    marketing_copy_variant: variant,
  });
};

export const trackPageView = (page: string, title?: string) => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return;

  trackEvent('page_view', {
    page,
    title: title || document.title,
  });

  // Manual $pageview per PostHog docs; include $current_url for dashboard/URL breakdown
  posthog.capture('$pageview', { $current_url: window.location.href });
};

const trackScrollDepth = (depth: number) => {
  trackEvent('landing_scroll_depth', {
    depth,
  });
};

const trackSectionView = (sectionId: string) => {
  trackEvent('landing_section_view', {
    section: sectionId,
  });
};

const trackLandingClick = (payload: Record<string, unknown>) => {
  trackEvent('landing_click', payload);
};

export const startLandingTracking = () => {
  if (landingTrackingInitialized || typeof window === 'undefined') return;
  if (!isAnalyticsEnabled()) return;

  landingTrackingInitialized = true;
  trackPageView('landing');

  const startedAt = Date.now();
  const trackedDepths = new Set<number>();
  const trackedSections = new Set<string>();

  const resolveScrollDepth = () => {
    const doc = document.documentElement;
    const totalScroll = doc.scrollHeight - window.innerHeight;
    if (totalScroll <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((window.scrollY / totalScroll) * 100)));
  };

  const handleScroll = () => {
    const depth = resolveScrollDepth();
    const thresholds = [25, 50, 75, 100];
    thresholds.forEach((threshold) => {
      if (depth >= threshold && !trackedDepths.has(threshold)) {
        trackedDepths.add(threshold);
        trackScrollDepth(threshold);
      }
    });

    ['infrastructure', 'beta'].forEach((sectionId) => {
      if (trackedSections.has(sectionId)) return;
      const section = document.getElementById(sectionId);
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.6) {
        trackedSections.add(sectionId);
        trackSectionView(sectionId);
      }
    });
  };

  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const anchor = target.closest('a');
    const button = target.closest('button');
    if (!anchor && !button) return;

    const label = (anchor?.textContent || button?.textContent || '').trim();
    if (!label) return;

    const href = anchor?.getAttribute('href') || undefined;
    trackLandingClick({
      label,
      href,
      element: anchor ? 'link' : 'button',
    });
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      trackEvent('landing_time_on_page', {
        milliseconds: Date.now() - startedAt,
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('click', handleClick, true);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  setTimeout(handleScroll, 500);
};

export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
  if (!isAnalyticsEnabled()) return;
  posthog.identify(userId, properties);
};

export const resetUser = () => {
  if (!isAnalyticsEnabled()) return;
  posthog.reset();
};
