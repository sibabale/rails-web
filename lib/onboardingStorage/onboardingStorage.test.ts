import { describe, expect, it } from 'vitest';
import { defaultOnboardingState } from './index';

describe('onboardingStorage', () => {
  it('keeps default onboarding flags false', () => {
    expect(defaultOnboardingState).toEqual({
      dbsConnected: false,
      initialMigrationsApplied: false,
      apiKeyGenerated: false,
      firstRequestSent: false,
      dismissed: false,
    });
  });
});
