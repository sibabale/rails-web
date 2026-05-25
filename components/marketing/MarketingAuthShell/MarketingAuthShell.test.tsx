import { describe, it } from 'vitest';

describe('MarketingAuthShell', () => {
  it.skip('TODO: renders login/register chrome with auth-buttons feature flag', () => {
    // MarketingAuthShell uses next/navigation usePathname and isAuthButtonsEnabled
    // from @/lib/env, plus theme toggle and docs CTA. A meaningful smoke test requires
    // mocking those modules. Add when shell behaviour needs guarding directly rather
    // than via the auth pages.
  });
});
