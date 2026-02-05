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

  it('initializes PostHog once when enabled', async () => {
    const posthog = (await import('posthog-js')).default as { init: ReturnType<typeof vi.fn> };
    const { initializeAnalytics } = await import('../lib/analytics');

    initializeAnalytics();
    initializeAnalytics();

    expect(posthog.init).toHaveBeenCalledTimes(1);
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
