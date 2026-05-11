import { describe, expect, it } from 'vitest';
import { getMarketingSiteCopy } from '@/lib/marketingSiteCopy';

describe('marketingSiteCopy', () => {
  it('uses the approved variant A home copy', () => {
    const copy = getMarketingSiteCopy('a').home;

    expect(copy.heroSubtitle).toBe('iterate faster without legacy concerns.');
    expect(copy.problemTitle).toBe('move money without building the rails yourself.');
  });
});
