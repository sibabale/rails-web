'use client';

import Link from 'next/link';
import React from 'react';
import { Section } from '@/components/atoms/Section/Section';
import { Container } from '@/components/atoms/Container/Container';
import { Heading } from '@/components/atoms/Heading/Heading';
import { isAuthButtonsEnabled } from '@/lib/env';
import { MarketingDocsCtaLink } from '@/components/marketing/atoms/MarketingDocsCtaLink/MarketingDocsCtaLink';
import { theme } from '@/lib/marketingTheme';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider/MarketingCopyVariantProvider';

export function CallToAction({
  title: titleOverride,
}: {
  /** When set, replaces variant-driven CTA headline (use sparingly). */
  title?: string;
}) {
  const { copy } = useMarketingSiteCopy();
  const title = titleOverride ?? copy.cta.title;
  const showAuthButtons = isAuthButtonsEnabled();
  return (
    <Section>
      <Container className="px-8 py-24 text-center flex flex-col items-center">
        <Heading level={2} className="mb-8" data-testid="marketing-cta-heading">
          {title}
        </Heading>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {showAuthButtons ? (
            <Link
              href="/login"
              data-testid="marketing-get-started-cta"
              className={`px-8 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${theme.buttons.primary}`}
            >
              {copy.cta.primaryLabel}{' '}
              <span className="material-symbols-sharp ml-2" style={{ fontSize: '1rem' }}>
                arrow_forward
              </span>
            </Link>
          ) : null}
          <MarketingDocsCtaLink
            data-testid="marketing-read-docs-cta"
            className={`px-8 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${
              showAuthButtons ? theme.buttons.secondary : theme.buttons.primary
            }`}
          >
            <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }}>
              menu_book
            </span>
            <span>{copy.cta.secondaryLabel}</span>
          </MarketingDocsCtaLink>
        </div>
      </Container>
    </Section>
  );
}
