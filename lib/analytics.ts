import posthog from 'posthog-js';

const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || DEFAULT_POSTHOG_HOST;

let analyticsInitialized = false;
let landingTrackingInitialized = false;

const isAnalyticsEnabled = () => {
  const enabledInEnv = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  const isDev = import.meta.env.DEV;
  return enabledInEnv || isDev;
};

export const initializeAnalytics = () => {
  if (analyticsInitialized || typeof window === 'undefined') return;
  if (!isAnalyticsEnabled() || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    cross_subdomain_cookie: false,
    persistence: 'localStorage',
    autocapture: false,
  });

  analyticsInitialized = true;
};

export const trackEvent = (eventName: string, properties: Record<string, unknown> = {}) => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return;

  posthog.capture(eventName, {
    ...properties,
    timestamp: Date.now(),
    url: window.location.href,
    user_agent: navigator.userAgent,
  });
};

export const trackPageView = (page: string, title?: string) => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return;

  trackEvent('page_view', {
    page,
    title: title || document.title,
  });

  posthog.capture('$pageview');
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
