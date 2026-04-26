'use client';

import Link from 'next/link';
import React from 'react';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { getMarketingDocsHref } from '@/lib/env';
import { theme } from '@/lib/marketingTheme';

export function CallToAction({
  title = 'Start building financial products on trusted rails.',
}: {
  title?: string;
}) {
  const docsHref = getMarketingDocsHref();
  return (
    <Section>
      <Container className="px-8 py-24 text-center flex flex-col items-center">
        <Heading level={2} className="mb-8">
          {title}
        </Heading>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            data-testid="marketing-get-started-cta"
            className={`px-8 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${theme.buttons.primary}`}
          >
            Get Started{' '}
            <span className="material-symbols-sharp ml-2" style={{ fontSize: '1rem' }}>
              arrow_forward
            </span>
          </Link>
          <Link
            href={docsHref}
            data-testid="marketing-read-docs-cta"
            className={`px-8 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${theme.buttons.secondary}`}
          >
            Read Documentation
          </Link>
        </div>
      </Container>
    </Section>
  );
}
