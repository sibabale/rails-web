import Link from 'next/link';
import React from 'react';
import { getMarketingDocsCtaUrl } from '@/lib/env';

export type MarketingDocsCtaLinkProps = Omit<
  React.ComponentPropsWithoutRef<'a'>,
  'href' | 'target' | 'rel'
> & {
  children: React.ReactNode;
};

/**
 * Documentation destinations (`Read Documentation`, `Read Docs`, header nav **Documentation**).
 * `href` comes from {@link getMarketingDocsCtaUrl} (`NEXT_PUBLIC_DOCS_URL`). Absolute `http(s):` and
 * protocol-relative `//` URLs open in a new tab; same-site paths (e.g. `/docs`) use `next/link` (no new tab).
 */
function isAbsoluteOrProtocolRelativeHttp(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith('//');
}

export function MarketingDocsCtaLink({ children, className, ...rest }: MarketingDocsCtaLinkProps) {
  const href = getMarketingDocsCtaUrl();
  if (!isAbsoluteOrProtocolRelativeHttp(href)) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}
