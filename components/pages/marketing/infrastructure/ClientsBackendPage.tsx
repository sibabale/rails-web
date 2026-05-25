'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ArchitectureDiagram from '@/components/organisms/ArchitectureDiagram/ArchitectureDiagram';
import { SiTypescript, SiGo, SiKotlin, SiOpenjdk, SiDotnet, SiGithub } from '@icons-pack/react-simple-icons';
import { motion } from 'motion/react';
import { CallToAction } from '@/components/organisms/CallToAction/CallToAction';
import { Section } from '@/components/atoms/Section/Section';
import { Container } from '@/components/atoms/Container/Container';
import { Heading } from '@/components/atoms/Heading/Heading';
import { Text } from '@/components/atoms/Text/Text';
import { useMarketingSiteCopy } from '@/components/organisms/MarketingCopyVariantProvider/MarketingCopyVariantProvider';
import { RAILSINFRA_GITHUB_ORG_REPOSITORIES_URL } from '@/lib/railsinfraGithub';

const FLOW_ICONS = ['ads_click', 'smartphone', 'settings', 'terminal', 'gpp_good', 'database'] as const;

export default function ClientsBackend() {
  const { copy, withCopy } = useMarketingSiteCopy();
  const c = copy.clientsBackend;
  const flowSteps = c.flowSteps.map((text, idx) => ({
    icon: FLOW_ICONS[idx],
    text,
    highlight: idx === 3,
  }));

  const sdks = [
    { name: 'TypeScript', Icon: SiTypescript },
    { name: 'Go', Icon: SiGo },
    { name: 'Kotlin', Icon: SiKotlin },
    { name: 'Java', Icon: SiOpenjdk },
    { name: '.NET', Icon: SiDotnet },
  ].map((sdk) => ({ ...sdk, link: RAILSINFRA_GITHUB_ORG_REPOSITORIES_URL }));

  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 18); // Loop with a nice pause at the end
    }, 800); // 800ms per stage (icon -> line -> icon)
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
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
              <Text variant="micro" className="mb-6">{c.micro}</Text>
              <Heading level={1} className="mb-8 leading-[1.1]">{c.heroTitle}</Heading>
              <Text variant="p" className="!text-xl">
                {c.heroSubtitle}
              </Text>
            </div>
            <div className="flex justify-center p-8 bg-zinc-100/50 dark:bg-[#050505]/50 border structural-border rounded-sm transition-colors">
              <ArchitectureDiagram activeSection="clients" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Content Section */}
      <Section className="bg-white dark:bg-black transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24 w-full">
        <div className="prose dark:prose-invert prose-zinc mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
          <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
            <span className="material-symbols-sharp text-zinc-500" style={{ fontSize: '1.5rem' }}>
              extension
            </span>
            {c.logicTitle}
          </Heading>
          <Text variant="p" className="mb-6">
            {c.logicP1}
          </Text>
          <Text variant="p" className="mb-10">
            {c.logicP2}
          </Text>

          <div className="mt-20 pt-10 border-t structural-border transition-colors">
            <h3 className="text-black dark:text-white text-2xl font-medium mb-12 transition-colors">{c.flowHeading}</h3>
            <div className="flex flex-col relative space-y-0 text-lg">
              
              {flowSteps.map((step, idx) => {
                const isNodeActive = animationStep >= idx * 2;
                const isEdgeActive = animationStep >= idx * 2 + 1;
                const isLastNode = idx === flowSteps.length - 1;
                const isPopping = isLastNode && animationStep === idx * 2;

                const Icon = step.icon;

                return (
                  <React.Fragment key={idx}>
                    <div className="flex gap-6 items-start relative z-10">
                      <motion.div 
                        initial={{ scale: 1 }}
                        animate={isPopping ? { scale: [1, 1.2, 0.95, 1] } : { scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isNodeActive 
                            ? 'border-emerald-600 dark:border-emerald-500 bg-zinc-50 dark:bg-[#050505] shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                            : 'structural-border bg-white dark:bg-[#050505]'
                        }`}
                      >
                        <span className={`material-symbols-sharp transition-colors duration-500 ${
                          isNodeActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'
                        }`} style={{ fontSize: '1.25rem' }}>{Icon}</span>
                      </motion.div>
                      <div className="pt-2.5">
                        <p className={`font-light m-0 transition-colors duration-500 ${
                          isNodeActive
                            ? (step.highlight ? 'text-black dark:text-zinc-200 font-medium' : 'text-zinc-800 dark:text-zinc-300')
                            : 'text-zinc-400 dark:text-zinc-600'
                        }`}>
                          {step.text}
                        </p>
                      </div>
                    </div>

                    {!isLastNode && (
                      <div className="flex gap-6">
                        <div className="w-12 flex justify-center py-2 shrink-0">
                          <div className={`w-px h-10 border-l border-dashed transition-colors duration-500 ${
                            isEdgeActive ? 'border-emerald-600/70 dark:border-emerald-500/70' : 'border-zinc-300 dark:border-zinc-800'
                          }`}></div>
                        </div>
                        <div></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

            </div>
          </div>

        </div>

        {/* SDK links: outside prose so the grid can use full container width on large screens */}
        <div className="mt-20 pt-10 border-t structural-border transition-colors mx-auto w-full max-w-3xl lg:max-w-none">
          <h3 className="text-lg text-black dark:text-white font-medium mb-8 transition-colors">{c.sdkFooterTitle}</h3>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-5 gap-4">
            {sdks.map((sdk) => {
              const Icon = sdk.Icon;
              return (
                <a
                  key={sdk.name}
                  href={sdk.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-3 border structural-border p-4 hover:bg-zinc-50 dark:hover:bg-[#050505] hover:border-zinc-400 dark:hover:border-zinc-600 transition-all rounded-sm no-underline group cursor-pointer sm:gap-4"
                >
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white dark:bg-black border structural-border text-xs font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black dark:text-white m-0 p-0 leading-tight transition-colors truncate">
                      {sdk.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5 group-hover:text-zinc-800 dark:group-hover:text-zinc-400 transition-colors">
                      <SiGithub className="w-3 h-3 shrink-0" /> View Source
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
        </Container>
      </Section>

      <CallToAction />
    </div>
  );
}
