export type MarketingCopyVariantId = 'a' | 'd';

/** Session key for sticky marketing copy (A/B); used by provider and E2E. */
export const MARKETING_COPY_SESSION_KEY = 'rails_marketing_copy_variant';

/** Dev-only: set `localStorage` to `a` or `d` to force copy when PostHog is enabled (development builds only). */
export const MARKETING_COPY_DEV_STORAGE_KEY = 'rails_mkt_copy_dev';

const isVariant = (value: string | null | undefined): value is MarketingCopyVariantId =>
  value === 'a' || value === 'd';

export const parseMarketingCopyVariant = (raw: string | null | undefined): MarketingCopyVariantId | null =>
  isVariant(raw) ? raw : null;

/** Returns `pathname` unchanged; copy variant is no longer passed in the URL. */
export const appendMarketingCopyParam = (pathname: string, _variant: MarketingCopyVariantId): string =>
  pathname;
