'use client';

import React from 'react';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';
import { CallToAction } from '../molecules/CallToAction';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider';
function UseCasesRailsCore() {
  const { copy } = useMarketingSiteCopy();
  const rc = copy.useCases.railsCore;
  return (
    <>
      <div className="w-full border border-emerald-500 bg-white dark:bg-black p-6 text-center shadow-lg dark:shadow-xl relative text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 transition-colors">
        <div className="absolute top-0 left-0 px-3 py-1 text-[9px] uppercase tracking-widest font-bold bg-emerald-500 text-white dark:text-black transition-colors">
          {rc.ribbon}
        </div>
        <div className="mt-4 font-medium text-emerald-600 dark:text-emerald-400 transition-colors">{rc.headline}</div>
      </div>

      <div className="flex flex-col items-center w-full my-2 relative">
        <div className="h-4 w-px bg-emerald-500/50"></div>
        <div className="h-4 w-px bg-emerald-500/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 border-t border-emerald-500/50"></div>
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black p-4 text-center text-zinc-600 dark:text-zinc-500 flex flex-col items-center gap-2 transition-colors">
          <span className="material-symbols-sharp " style={{ fontSize: '1rem' }}>
            database
          </span>{' '}
          {rc.postgres}
        </div>
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black p-4 text-center text-zinc-600 dark:text-zinc-500 flex flex-col items-center gap-2 transition-colors">
          <span className="material-symbols-sharp " style={{ fontSize: '1rem' }}>
            dns
          </span>{' '}
          {rc.telemetry}
        </div>
      </div>
    </>
  );
}

export default function UseCases() {
  const { copy } = useMarketingSiteCopy();
  const b = copy.useCases.banks;
  const n = copy.useCases.neoBanks;
  const f = copy.useCases.fintech;
  return (
    <div className="flex flex-col">
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24 text-center flex flex-col items-center">
          <div className="label-micro mb-6">{copy.useCases.micro}</div>
          <Heading level={1} className="mb-8 leading-[1.1] max-w-3xl">
            {copy.useCases.heroTitle}
          </Heading>
          <Text variant="p" className="max-w-2xl">
            {copy.useCases.heroSubtitle}
          </Text>
        </Container>
      </Section>

      {/* Case 1: Banks */}
      <Section className="border-b structural-border bg-white dark:bg-black transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 border-l border-r structural-border">
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border">
              <div className="inline-flex items-center gap-2 mb-6 text-zinc-500 dark:text-zinc-400">
                 <span className="font-medium text-black dark:text-white transition-colors">{b.label}</span>
              </div>
              <Heading level={2} className="mb-6">{b.title}</Heading>
              <Text variant="p" className="mb-6">
                {b.p1}
              </Text>
              <Text variant="p" className="mb-8">
                {b.p2}
              </Text>
              
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                {b.bullets.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="material-symbols-sharp shrink-0 text-emerald-500" style={{ fontSize: '1rem' }}>check_circle</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Architecture stack (Top to bottom) */}
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden transition-colors">
                <div className="w-full max-w-sm mx-auto flex flex-col items-center font-mono text-xs">
                    
                    {/* UI Layer */}
                    <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-4 text-center shadow-lg dark:shadow-sm relative z-10 text-black dark:text-white transition-colors">
                        {b.diagramUi}
                    </div>
                    
                    <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                    </div>

                    {/* Compliance Layer */}
                    <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 text-center shadow-lg dark:shadow-sm relative z-10 text-zinc-600 dark:text-zinc-400 transition-colors">
                        <div className="flex items-center justify-center gap-2"><span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>gpp_bad</span> {b.diagramCompliance}</div>
                    </div>
                    
                    <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                    </div>

                    <UseCasesRailsCore />
                </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Case 2: NeoBanks */}
      <Section className="border-b structural-border bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 border-l border-r structural-border">
            
            <div className="bg-zinc-100 dark:bg-[#0a0a0a] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r structural-border order-last lg:order-first transition-colors">
                 <div className="w-full max-w-sm mx-auto flex flex-col items-center font-mono text-xs">
                     <div className="grid grid-cols-3 gap-2 w-full mb-2">
                         <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-3 text-center text-zinc-600 dark:text-zinc-400 transition-colors shadow-sm dark:shadow-none">iOS</div>
                         <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-3 text-center text-zinc-600 dark:text-zinc-400 transition-colors shadow-sm dark:shadow-none">Android</div>
                         <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-3 text-center text-zinc-600 dark:text-zinc-400 transition-colors shadow-sm dark:shadow-none">Web</div>
                     </div>
                     <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                     </div>
                     <div className="w-full border border-sky-200 dark:border-sky-500/50 bg-sky-50 dark:bg-[#001020] p-4 text-center text-sky-700 dark:text-sky-400 mb-2 transition-colors">
                         BFF Node.js Gateway
                     </div>
                     <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                     </div>
                     <div className="w-full border border-orange-200 dark:border-orange-500/50 bg-orange-50 dark:bg-[#100500] p-4 text-center text-orange-700 dark:text-orange-400 mb-2 transition-colors">
                         Crypto On-Ramp API
                     </div>
                     <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                     </div>
                     <UseCasesRailsCore />
                 </div>
            </div>

            <div className="p-8 lg:p-16 flex flex-col justify-center order-first lg:order-last">
              <div className="inline-flex items-center gap-2 mb-6 text-zinc-500 dark:text-zinc-400">
                 <span className="font-medium text-black dark:text-white transition-colors">{n.label}</span>
              </div>
              <Heading level={2} className="mb-6">{n.title}</Heading>
              <Text variant="p" className="mb-6">
                {n.p1}
              </Text>
              <Text variant="p" className="mb-8">
                {n.p2}
              </Text>
              
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                {n.bullets.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="material-symbols-sharp shrink-0 text-emerald-500" style={{ fontSize: '1rem' }}>check_circle</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </Container>
      </Section>

      {/* Case 3: Fintechs */}
      <Section className="border-b structural-border bg-white dark:bg-black transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 border-l border-r structural-border">
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border">
              <div className="inline-flex items-center gap-2 mb-6 text-zinc-500 dark:text-zinc-400">
                 <span className="font-medium text-black dark:text-white transition-colors">{f.label}</span>
              </div>
              <Heading level={2} className="mb-6">{f.title}</Heading>
              <Text variant="p" className="mb-6">
                {f.p1}
              </Text>
              <Text variant="p" className="mb-8">
                {f.p2}
              </Text>
              
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                {f.bullets.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="material-symbols-sharp shrink-0 text-emerald-500" style={{ fontSize: '1rem' }}>check_circle</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden transition-colors">
                 <div className="w-full max-w-sm mx-auto flex flex-col items-center font-mono text-xs">
                     <div className="w-full border border-indigo-200 dark:border-indigo-500/50 bg-indigo-50 dark:bg-[#050510] p-4 text-center text-indigo-700 dark:text-indigo-400 transition-colors">
                         Business Logic Controller (Go)
                     </div>
                     <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                     </div>
                     <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 text-center text-zinc-600 dark:text-zinc-400 flex items-center justify-between shadow-sm dark:shadow-none transition-colors">
                         <span>Kafka Event Bus</span>
                         <span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>settings</span>
                     </div>
                     <div className="flex flex-col items-center w-full my-2 relative">
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="absolute top-1/2 right-1/2 translate-x-4 -translate-y-1/2 text-[9px] text-emerald-600 dark:text-emerald-500/80">gRPC</div>
                     </div>
                     <UseCasesRailsCore />
                 </div>
            </div>
            
          </div>
        </Container>
      </Section>

      <CallToAction />
    </div>
  );
}
