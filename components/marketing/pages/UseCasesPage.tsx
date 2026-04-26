'use client';

import React from 'react';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';
import { CallToAction } from '../molecules/CallToAction';
import { ArrowLeft, Database, Server, Cog, CheckCircle2, ShieldAlert } from 'lucide-react';

const RailsCoreStructure = () => (
  <>
    {/* Rails Engine */}
    <div className="w-full border border-emerald-500 bg-white dark:bg-black p-6 text-center shadow-lg dark:shadow-xl relative text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 transition-colors">
         <div className="absolute top-0 left-0 px-3 py-1 text-[9px] uppercase tracking-widest font-bold bg-emerald-500 text-white dark:text-black transition-colors">
            Rails Core
         </div>
         <div className="mt-4 font-medium text-emerald-600 dark:text-emerald-400 transition-colors">Double-Entry Ledger & Accounts</div>
    </div>

    <div className="flex flex-col items-center w-full my-2 relative">
        <div className="h-4 w-px bg-emerald-500/50"></div>
        <div className="h-4 w-px bg-emerald-500/50"></div>
        {/* Horizontal connector */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 border-t border-emerald-500/50"></div>
    </div>

    <div className="w-full grid grid-cols-2 gap-4">
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black p-4 text-center text-zinc-600 dark:text-zinc-500 flex flex-col items-center gap-2 transition-colors">
            <span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>database</span> PostgreSQL
        </div>
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black p-4 text-center text-zinc-600 dark:text-zinc-500 flex flex-col items-center gap-2 transition-colors">
            <span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>dns</span> Telemetry & Audit
        </div>
    </div>
  </>
);

export default function UseCases() {
  return (
    <div className="flex flex-col">
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24 text-center flex flex-col items-center">
          <div className="label-micro mb-6">Real-world Implementations</div>
          <Heading level={1} className="mb-8 leading-[1.1] max-w-3xl">From legacy banks to modern fintechs.</Heading>
          <Text variant="p" className="max-w-2xl">
            See how different organizations are leveraging open-source banking rails to eliminate millions in maintenance costs while shipping faster.
          </Text>
        </Container>
      </Section>

      {/* Case 1: Banks */}
      <Section className="border-b structural-border bg-white dark:bg-black transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 border-l border-r structural-border">
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border">
              <div className="inline-flex items-center gap-2 mb-6 text-zinc-500 dark:text-zinc-400">
                 <span className="font-medium text-black dark:text-white transition-colors">Banks</span>
              </div>
              <Heading level={2} className="mb-6">Modernizing a 40-year-old core without downtime.</Heading>
              <Text variant="p" className="mb-6">
                Legacy banks often spend upwards of $10M+ annually maintaining monolithic mainframe ledgers that make launching new products incredibly slow. 
              </Text>
              <Text variant="p" className="mb-8">
                By replacing legacy cores with Rails, financial institutions can reduce operating costs by 80%, enable real-time clearing, and deploy a new consumer app structure safely—without a single dropped cent during the migration.
              </Text>
              
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> $12M/yr maintenance reduced to $2M/yr</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> 100% data fidelity preserved</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> Enabled Open Banking API access</li>
              </ul>
            </div>
            
            {/* Architecture stack (Top to bottom) */}
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden transition-colors">
                <div className="w-full max-w-sm mx-auto flex flex-col items-center font-mono text-xs">
                    
                    {/* UI Layer */}
                    <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-4 text-center shadow-lg dark:shadow-sm relative z-10 text-black dark:text-white transition-colors">
                        Web & Mobile Banking UI
                    </div>
                    
                    <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                    </div>

                    {/* Compliance Layer */}
                    <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 text-center shadow-lg dark:shadow-sm relative z-10 text-zinc-600 dark:text-zinc-400 transition-colors">
                        <div className="flex items-center justify-center gap-2"><span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>gpp_bad</span> Compliance & AML Service</div>
                    </div>
                    
                    <div className="flex flex-col items-center w-full my-2">
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                    </div>

                    <RailsCoreStructure />
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
                     <RailsCoreStructure />
                 </div>
            </div>

            <div className="p-8 lg:p-16 flex flex-col justify-center order-first lg:order-last">
              <div className="inline-flex items-center gap-2 mb-6 text-zinc-500 dark:text-zinc-400">
                 <span className="font-medium text-black dark:text-white transition-colors">NeoBanks</span>
              </div>
              <Heading level={2} className="mb-6">Launch multi-currency globally in months, not years.</Heading>
              <Text variant="p" className="mb-6">
                Neobanks often need to build a checking account combined with high-yield stablecoin savings. Building a secure, concurrent core ledger to track these disparate balances would normally delay a launch by 18 months.
              </Text>
              <Text variant="p" className="mb-8">
                By grabbing Rails off the shelf, engineering teams can focus purely on integrating their crypto provider and building an amazing mobile UX. They can go from zero to processing cards in under 14 weeks.
              </Text>
              
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> 14 week launch timeframe</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> Real-time multi-currency sync</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> Scale securely from day one</li>
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
                 <span className="font-medium text-black dark:text-white transition-colors">Fintech</span>
              </div>
              <Heading level={2} className="mb-6">Reconciling B2B money movement accurately at scale.</Heading>
              <Text variant="p" className="mb-6">
                B2B platforms handle millions of granular payment adjustments daily. Their in-house database solutions often face race conditions and reconciliation errors, forcing manual engineering interventions to balance the books.
              </Text>
              <Text variant="p" className="mb-8">
                By integrating the Rails gRPC API out of the box to act as an absolute source of truth, strict atomicity is enforced. Failed transfers rollback immediately and automatically, eliminating ghost balances forever.
              </Text>
              
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> Zero manual reconciliation needed</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> 10,000+ atomic tx/second throughput</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-emerald-500"    style={{ fontSize: '1rem' }}>check_circle</span> gRPC native networking for strict typing</li>
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
                     <RailsCoreStructure />
                 </div>
            </div>
            
          </div>
        </Container>
      </Section>

      <CallToAction />
    </div>
  );
}
