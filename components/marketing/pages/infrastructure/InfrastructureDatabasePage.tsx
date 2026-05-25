'use client';

import React from 'react';
import Link from 'next/link';
import ArchitectureDiagram from '../../ArchitectureDiagram/ArchitectureDiagram';
import { CallToAction } from '../../molecules/CallToAction/CallToAction';
import { Section } from '../../atoms/Section/Section';
import { Container } from '../../atoms/Container/Container';
import { Heading } from '../../atoms/Heading/Heading';
import { Text } from '../../atoms/Text/Text';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider/MarketingCopyVariantProvider';

export default function InfrastructureDatabase() {
  const { copy, withCopy } = useMarketingSiteCopy();
  const c = copy.database;
  return (
    <div className="flex flex-col">
      <Section className="bg-zinc-50 dark:bg-[#020202]">
        <Container className="px-8 py-16 lg:px-16 lg:py-24">
          <Link href={withCopy('/infrastructure')} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
            <span className="material-symbols-sharp " style={{ fontSize: '1rem' }}>
              arrow_back
            </span>{' '}
            {c.backLabel}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Text variant="micro" className="mb-6">
                {c.micro}
              </Text>
              <Heading level={1} className="mb-8 leading-[1.1]">
                {c.heroTitle}
              </Heading>
              <Text variant="p" className="!text-xl">
                {c.heroSubtitle}
              </Text>
            </div>
            <div className="flex justify-center p-8 bg-zinc-100 dark:bg-[#050505]/50 border structural-border rounded-sm">
              <ArchitectureDiagram activeSection="database" />
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="px-8 py-16 lg:px-16 lg:py-24 w-full">
          <div className="prose dark:prose-invert prose-zinc mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
              <span className="material-symbols-sharp text-zinc-500" style={{ fontSize: '1.5rem' }}>
                database
              </span>
              {c.byodTitle}
            </Heading>
            <Text variant="p" className="mb-6">
              {c.byodBody}
            </Text>
          </div>
        </Container>
      </Section>

      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24 w-full">
          <div
            className="prose dark:prose-invert prose-zinc mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl"
            data-testid="database-security-section"
          >
            <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
              <span className="material-symbols-sharp text-zinc-500" style={{ fontSize: '1.5rem' }}>
                shield_lock
              </span>
              {c.securityTitle}
            </Heading>
            <Text variant="p" className="mb-0">
              {c.securityBody}
            </Text>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="px-8 py-16 lg:px-16 lg:py-24 w-full">
          <div
            className="prose dark:prose-invert prose-zinc mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl"
            data-testid="database-compliance-section"
          >
            <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
              <span className="material-symbols-sharp text-zinc-500" style={{ fontSize: '1.5rem' }}>
                verified_user
              </span>
              {c.complianceTitle}
            </Heading>
            <Text variant="p" className="mb-0">
              {c.complianceBody}
            </Text>
          </div>
        </Container>
      </Section>

      <CallToAction />
    </div>
  );
}
