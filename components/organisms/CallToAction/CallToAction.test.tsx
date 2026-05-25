import { describe, it } from 'vitest';

describe('CallToAction', () => {
  it.skip('TODO: renders CTA copy from the resolved marketing variant', () => {
    // CallToAction depends on useMarketingSiteCopy (requires MarketingCopyVariantProvider
    // with a resolved variant) and isAuthButtonsEnabled from @/lib/env. A meaningful test
    // needs to mock both. The CTA is exercised indirectly via marketing pages today.
  });
});
