'use client';

import Link from 'next/link';
import React from 'react';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { getMarketingDocsHref, isAuthButtonsEnabled } from '@/lib/env';
import { theme } from '@/lib/marketingTheme';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider';

export function CallToAction({
  title: titleOverride,
}: {
  /** When set, replaces variant-driven CTA headline (use sparingly). */
  title?: string;
}) {
  const { copy, withCopy } = useMarketingSiteCopy();
  const rawDocs = getMarketingDocsHref();
  const docsHref = rawDocs.startsWith('/') ? withCopy(rawDocs) : rawDocs;
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
          <Link
            href={docsHref}
            data-testid="marketing-read-docs-cta"
            className={`px-8 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${theme.buttons.secondary}`}
          >
            <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }}>
              menu_book
            </span>
            <span>{copy.cta.secondaryLabel}</span>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
