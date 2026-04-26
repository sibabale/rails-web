'use client';

import React from 'react';
import Link from 'next/link';
import ArchitectureDiagram from '../../ArchitectureDiagram';
import { CallToAction } from '../../molecules/CallToAction';
import { Section } from '../../atoms/Section';
import { Container } from '../../atoms/Container';
import { Heading } from '../../atoms/Heading';
import { Text } from '../../atoms/Text';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider';

export default function RailsApi() {
  const { copy, withCopy } = useMarketingSiteCopy();
  const c = copy.railsApi;
  return (
    <div className="flex flex-col">
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24">
          <Link href={withCopy('/infrastructure')} className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
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
            <div className="flex justify-center p-8 bg-zinc-100/50 dark:bg-[#050505]/50 border structural-border rounded-sm transition-colors">
              <ArchitectureDiagram activeSection="api" />
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white dark:bg-black transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24 w-full">
          <div className="prose dark:prose-invert prose-zinc mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
              <span className="material-symbols-sharp text-zinc-500" style={{ fontSize: '1.5rem' }}>
                memory
              </span>
              {c.segregatedTitle}
            </Heading>
            <Text variant="p" className="mb-6">
              {c.splitIntro}
            </Text>

            <div
              className="mb-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group"
              data-testid="rails-api-nginx-gateway-box"
            >
              <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                <span
                  className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                  style={{ fontSize: '1.25rem' }}
                >
                  router
                </span>
              </div>
              <div>
                <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">
                  {c.nginxGatewayTitle}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">
                  {c.gatewayP1}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <span
                    className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ fontSize: '1.25rem' }}
                  >
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">{c.accountsTitle}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">{c.accountsBody}</p>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <span
                    className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ fontSize: '1.25rem' }}
                  >
                    group
                  </span>
                </div>
                <div>
                  <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">{c.usersTitle}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">{c.usersBody}</p>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <span
                    className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ fontSize: '1.25rem' }}
                  >
                    fact_check
                  </span>
                </div>
                <div>
                  <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">{c.auditTitle}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">{c.auditBody}</p>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <span
                    className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ fontSize: '1.25rem' }}
                  >
                    menu_book
                  </span>
                </div>
                <div>
                  <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">{c.ledgerTitle}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">{c.ledgerBody}</p>
                </div>
              </div>

              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <span
                    className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                    style={{ fontSize: '1.25rem' }}
                  >
                    lan
                  </span>
                </div>
                <div>
                  <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">{c.meshTitle}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">{c.meshBody}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <CallToAction />
    </div>
  );
}
