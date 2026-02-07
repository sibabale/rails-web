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
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
    vi.stubEnv('VITE_POSTHOG_KEY', 'test_key');
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://example.com');
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
    vi.stubEnv('VITE_POSTHOG_KEY', 'test_key');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
    vi.resetModules();
    const { isAnalyticsEnabled } = await import('../lib/analytics');
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it('isAnalyticsEnabled returns false when VITE_ENABLE_ANALYTICS is false', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test_key');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
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
});
