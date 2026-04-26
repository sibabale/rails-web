export type MarketingCopyVariantId = 'a' | 'd';

const isVariant = (value: string | null | undefined): value is MarketingCopyVariantId =>
  value === 'a' || value === 'd';

export const parseMarketingCopyVariant = (raw: string | null | undefined): MarketingCopyVariantId | null =>
  isVariant(raw) ? raw : null;

/** Preserves `copy` when linking between marketing routes. */
export const appendMarketingCopyParam = (
  pathname: string,
  variant: MarketingCopyVariantId
): string => {
  const sep = pathname.includes('?') ? '&' : '?';
  return `${pathname}${sep}copy=${variant}`;
};
