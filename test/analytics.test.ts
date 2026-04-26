import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', 'true');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test_key');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns PostHog options for provider', async () => {
    const { getPostHogOptions } = await import('../lib/analytics');
    const options = getPostHogOptions();

    expect(options).toMatchObject({
      api_host: 'https://example.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
    });
  });

  it('isAnalyticsEnabled returns true when key is set and not disabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test_key');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', 'true');
    vi.resetModules();
    const { isAnalyticsEnabled } = await import('../lib/analytics');
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it('isAnalyticsEnabled returns false when NEXT_PUBLIC_ENABLE_ANALYTICS is false', async () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test_key');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', 'false');
    vi.resetModules();
    const { isAnalyticsEnabled } = await import('../lib/analytics');
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it('captures events with landing metadata', async () => {
    const posthog = (await import('posthog-js')).default as { capture: ReturnType<typeof vi.fn> };
    const { trackEvent } = await import('../lib/analytics');

    trackEvent('landing_click', { label: 'Join the Waitlist' });

    expect(posthog.capture).toHaveBeenCalledWith(
      'landing_click',
      expect.objectContaining({
        label: 'Join the Waitlist',
        timestamp: expect.any(Number),
      })
    );
  });

  it('tracks marketing copy exposure once per variant per session', async () => {
    sessionStorage.clear();
    const posthog = (await import('posthog-js')).default as { capture: ReturnType<typeof vi.fn> };
    posthog.capture.mockClear();
    const { trackMarketingCopyExposure } = await import('../lib/analytics');

    trackMarketingCopyExposure('a');
    trackMarketingCopyExposure('a');
    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledWith(
      'marketing_copy_exposure',
      expect.objectContaining({ marketing_copy_variant: 'a' })
    );

    trackMarketingCopyExposure('d');
    expect(posthog.capture).toHaveBeenCalledTimes(2);
  });
});
