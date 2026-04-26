import { describe, expect, it } from 'vitest';
import { appendMarketingCopyParam } from '@/lib/marketingCopyVariant';

describe('appendMarketingCopyParam', () => {
  it('adds copy query to a path without search', () => {
    expect(appendMarketingCopyParam('/infrastructure', 'd')).toBe('/infrastructure?copy=d');
  });

  it('appends copy when path already has query', () => {
    expect(appendMarketingCopyParam('/?foo=1', 'a')).toBe('/?foo=1&copy=a');
  });
});
