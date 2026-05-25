import { describe, it } from 'vitest';

describe('MarketingCopyVariantProvider', () => {
  it.skip('TODO: covers async variant resolution via session/dev/flags/default', () => {
    // The provider depends on PostHog flag readiness, sessionStorage, localStorage,
    // and a 4s timeout fallback. Meaningful coverage requires a non-trivial harness
    // (mocking @/lib/analytics, @/lib/env, sessionStorage, and matchMedia in jsdom).
    // The provider's branches are exercised indirectly today via integration tests
    // through marketing pages; expand here when those branches need direct unit cover.
  });
});
