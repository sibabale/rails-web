'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import {
  HERO_SDK_LABELS,
  MarketingHeroCodeSample,
  type HeroSdkLabel,
} from '@/components/marketing/heroSdkSamples/heroSdkSamples';
import { CallToAction } from '../molecules/CallToAction/CallToAction';
import { Section } from '../atoms/Section/Section';
import { Heading } from '../atoms/Heading/Heading';
import { Text } from '../atoms/Text/Text';
import { startLandingTracking } from '@/lib/analytics';
import { isAuthButtonsEnabled } from '@/lib/env';
import { MarketingDocsCtaLink } from '@/components/marketing/atoms/MarketingDocsCtaLink/MarketingDocsCtaLink';
import { CodeScrollPane } from '../atoms/CodeScrollPane/CodeScrollPane';
import { theme } from '@/lib/marketingTheme';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider/MarketingCopyVariantProvider';

export default function MarketingHome() {
  const { copy } = useMarketingSiteCopy();
  const showAuthButtons = isAuthButtonsEnabled();
  const [activeSdk, setActiveSdk] = useState<HeroSdkLabel>('TypeScript');
  const [sdkMenuOpen, setSdkMenuOpen] = useState(false);
  const sdkMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startLandingTracking();
  }, []);

  useEffect(() => {
    if (!sdkMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = sdkMenuRef.current;
      if (el && !el.contains(e.target as Node)) setSdkMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [sdkMenuOpen]);

  const heroTitleLines = copy.home.heroTitle.split('\n');

  return (
    <>
      {/* Section: Hero — structural borders aligned with sections below (max-w-7xl + border on inner grid) */}
      <Section
        className={`${theme.colors.background.primary} relative`}
        data-testid="marketing-hero-section"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-l border-r structural-border ${theme.colors.background.primary}`}
          >
            {/* Left Column: Copy */}
            <div
              className={`p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border ${theme.colors.background.primary}`}
            >
              <div className={`${theme.typography.micro} mb-8 inline-flex items-center gap-2 ${theme.colors.text.secondary}`}>
                <span
                  className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-white shrink-0 animate-pulse"
                  aria-hidden
                />
                {copy.home.heroEyebrow}
              </div>
              <h1
                className={`${theme.typography.h1} mb-6 font-heading`}
                data-testid="marketing-hero-heading"
              >
                {heroTitleLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < heroTitleLines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </h1>
              <p className={`${theme.typography.p} mb-10 max-w-md`}>{copy.home.heroSubtitle}</p>
              <div className="flex flex-wrap items-center gap-4">
                {showAuthButtons ? (
                  <Link
                    href="/login"
                    data-testid="marketing-get-started-hero"
                    className={`px-6 py-3 text-sm inline-flex items-center gap-2 rounded-none ${theme.buttons.primary}`}
                  >
                    {copy.home.heroPrimaryCta}
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
                  </Link>
                ) : null}
                <MarketingDocsCtaLink
                  data-testid="marketing-read-docs-hero"
                  className={`px-6 py-3 text-sm inline-flex items-center gap-2 rounded-none ${
                    showAuthButtons ? theme.buttons.secondary : theme.buttons.primary
                  }`}
                >
                  <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }} aria-hidden>
                    menu_book
                  </span>
                  <span>{copy.cta.secondaryLabel}</span>
                </MarketingDocsCtaLink>
              </div>

              <div className="mt-16 pt-8 border-t structural-border">
                <div className={`${theme.typography.micro} mb-4`}>{copy.home.heroSupportedSdksLabel}</div>
                <div className={`flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm ${theme.colors.text.muted}`}>
                  {HERO_SDK_LABELS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      data-testid={`marketing-hero-sdk-footer-${name.toLowerCase().replace('.', '')}`}
                      onClick={() => setActiveSdk(name)}
                      className={`hover:text-black dark:hover:text-white cursor-pointer sm:cursor-crosshair transition-colors text-left ${
                        activeSdk === name ? 'text-black dark:text-white underline underline-offset-4' : ''
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Code / Technical */}
            <div
              className={`${theme.colors.background.secondary} p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden`}
            >
              <div className={`border ${theme.colors.border} bg-white dark:bg-black w-full shadow-2xl transition-colors`}>
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b structural-border bg-zinc-100 dark:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-center gap-2 shrink-0" aria-hidden>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800 transition-colors" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800 transition-colors" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800 transition-colors" />
                  </div>
                  <div ref={sdkMenuRef} className="relative min-w-0 flex justify-end">
                    <button
                      type="button"
                      data-testid="marketing-hero-sdk-toggle"
                      aria-expanded={sdkMenuOpen}
                      aria-haspopup="listbox"
                      className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-sm shadow-sm dark:shadow-none max-w-full"
                      onClick={() => setSdkMenuOpen((o) => !o)}
                    >
                      <span className="truncate">{activeSdk}</span>
                      <span
                        className={`material-symbols-sharp shrink-0 transition-transform ${sdkMenuOpen ? 'rotate-180' : ''}`}
                        style={{ fontSize: '0.75rem' }}
                        aria-hidden
                      >
                        expand_more
                      </span>
                    </button>
                    {sdkMenuOpen ? (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-sm border structural-border bg-white py-1 shadow-xl dark:bg-zinc-900 dark:shadow-none"
                        data-testid="marketing-hero-sdk-menu"
                        role="listbox"
                      >
                        {HERO_SDK_LABELS.map((sdk) => (
                          <button
                            key={sdk}
                            type="button"
                            role="option"
                            aria-selected={activeSdk === sdk}
                            className={`w-full px-3 py-1.5 text-left font-mono text-[10px] transition-colors ${
                              activeSdk === sdk
                                ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                            }`}
                            onClick={() => {
                              setActiveSdk(sdk);
                              setSdkMenuOpen(false);
                            }}
                          >
                            {sdk}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <CodeScrollPane className="p-6" data-testid="marketing-hero-code-sample">
                  <pre className="font-mono text-[13px] leading-relaxed">
                    <MarketingHeroCodeSample activeSdk={activeSdk} />
                  </pre>
                </CodeScrollPane>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Section: Problem / Why Rails */}
      <Section className="bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto border-l border-r structural-border px-8 pt-16 pb-24 lg:px-16 lg:pt-24 lg:pb-32 flex flex-col items-center text-center transition-colors">
          <span className="material-symbols-sharp text-black dark:text-white mb-6 transition-colors"    style={{ fontSize: '2rem' }}>shield</span>
          <Heading level={2} className="mb-6 max-w-2xl">
            {copy.home.problemTitle}
          </Heading>
          <Text variant="p" className="max-w-3xl">
            {copy.home.problemLead}
            <span className="text-black dark:text-white transition-colors">{copy.home.problemEmphasis}</span>
          </Text>
        </div>
      </Section>

      {/* Section: Modules Grid */}
      <Section className="transition-colors" id="infrastructure">
        <div className="max-w-7xl mx-auto border-l border-r structural-border transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {copy.home.modules.map((feature, idx) => (
              <div key={idx} className="p-8 border-b md:border-b-0 md:[&:not(:nth-last-child(-n+3))]:border-b lg:[&:not(:nth-last-child(-n+3))]:border-b lg:border-r border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors group">
                <div className="w-10 h-10 border structural-border bg-white dark:bg-black flex items-center justify-center mb-6 group-hover:border-zinc-400 dark:group-hover:border-zinc-700 transition-colors">
                  <span className="material-symbols-sharp text-black dark:text-white transition-colors" style={{ fontSize: '1rem' }}>{feature.icon}</span>
                </div>
                <h3 className="text-lg text-black dark:text-white font-medium mb-3 transition-colors">{feature.title}</h3>
                <Text variant="p" className="!text-zinc-600 dark:!text-zinc-500 !text-sm !leading-relaxed">{feature.desc}</Text>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Section: OSS / Security */}
      <Section className="bg-zinc-50 dark:bg-[#030303] transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 border-l border-r structural-border">
            <div className="p-8 lg:p-16 border-b lg:border-b-0 lg:border-r structural-border flex flex-col justify-center">
              <Text variant="micro" className="mb-6">{copy.home.ossMicro}</Text>
              <Heading level={2} className="!text-2xl sm:!text-3xl mb-6">{copy.home.ossHeading}</Heading>
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                {copy.home.ossBullets.map((line, i) => {
                  const icons = ['lock', 'code', 'inventory_2'] as const;
                  const icon = icons[i] ?? 'code';
                  const isLast = i === copy.home.ossBullets.length - 1;
                  return (
                    <li key={`${i}-${line}`} className="flex gap-3">
                      {isLast ? (
                        <SiGithub className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-600" />
                      ) : (
                        <span
                          className="material-symbols-sharp shrink-0 text-zinc-400 dark:text-zinc-600"
                          style={{ fontSize: '1rem' }}
                        >
                          {icon}
                        </span>
                      )}
                      {line}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Architecture Diagram */}
            <div className="p-8 lg:p-16 bg-white dark:bg-black flex flex-col justify-center font-mono text-xs transition-colors">
              <Text variant="micro" className="mb-8">Architecture Overview</Text>
              
              <div className="flex flex-col items-center text-zinc-500 w-full max-w-sm mx-auto">
                <div className="w-full border border-dashed structural-border p-4 text-center bg-zinc-50 dark:bg-[#0a0a0a] text-black dark:text-white shadow-lg dark:shadow-2xl transition-colors">SDK</div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 my-1 transition-colors"></div>
                <div className="w-full border border-zinc-400 dark:border-zinc-700 p-4 text-center bg-zinc-100 dark:bg-[#111] text-black dark:text-white uppercase tracking-widest font-bold text-[10px] transition-colors">rails core</div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 my-1 transition-colors"></div>
                <div className="w-full border structural-border p-4 flex justify-between bg-zinc-50 dark:bg-[#0a0a0a] transition-colors">
                  <span className="text-zinc-600 dark:text-zinc-300">Ledger</span>
                  <span className="text-zinc-600 dark:text-zinc-300">Accounts</span>
                  <span className="text-zinc-600 dark:text-zinc-300">Users</span>
                </div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 my-1 transition-colors"></div>
                <div className="w-full border border-dashed structural-border p-4 text-center bg-white dark:bg-black transition-colors">Database</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Section: CTA */}
      <div id="beta">
        <CallToAction />
      </div>
    </>
  );
}
