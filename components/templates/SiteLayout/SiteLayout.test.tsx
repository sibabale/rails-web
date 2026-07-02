import { describe, it } from 'vitest';

describe('SiteLayout', () => {
  it.skip('TODO: renders header/nav/footer chrome with copy variant context', () => {
    // SiteLayout consumes useMarketingSiteCopy (requires MarketingCopyVariantProvider with
    // a resolved variant) and usePathname from next/navigation. A meaningful smoke test
    // needs to mock both and stub @/lib/env feature flags. Add coverage when behaviour
    // (e.g. nav-link visibility, theme toggle wiring) needs guarding.
  });
});
