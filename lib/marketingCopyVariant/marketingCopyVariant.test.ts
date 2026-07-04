import { describe, expect, it } from 'vitest';
import {
  appendMarketingCopyParam,
  MARKETING_COPY_DEV_STORAGE_KEY,
  MARKETING_COPY_SESSION_KEY,
} from '@/lib/marketingCopyVariant';

describe('marketingCopyVariant', () => {
  it('does not append copy to URLs (clean links)', () => {
    expect(appendMarketingCopyParam('/infrastructure', 'd')).toBe('/infrastructure');
    expect(appendMarketingCopyParam('/?foo=1', 'a')).toBe('/?foo=1');
  });

  it('exports stable session storage keys for E2E and provider', () => {
    expect(MARKETING_COPY_SESSION_KEY).toBe('rails_marketing_copy_variant');
    expect(MARKETING_COPY_DEV_STORAGE_KEY).toBe('rails_mkt_copy_dev');
  });
});
