import { describe, expect, it } from 'vitest';
import { shouldHideOnboardingFlow } from './shouldHideOnboardingFlow';

describe('shouldHideOnboardingFlow', () => {
  it('returns true when all onboarding steps are complete', () => {
    expect(
      shouldHideOnboardingFlow({
        dbs: 'complete',
        apiKey: 'complete',
        firstRequest: 'complete',
      })
    ).toBe(true);
  });

  it('returns false when any onboarding step is not complete', () => {
    expect(
      shouldHideOnboardingFlow({
        dbs: 'complete',
        apiKey: 'complete',
        firstRequest: 'active',
      })
    ).toBe(false);
    expect(
      shouldHideOnboardingFlow({
        dbs: 'active',
        apiKey: 'locked',
        firstRequest: 'locked',
      })
    ).toBe(false);
  });
});
