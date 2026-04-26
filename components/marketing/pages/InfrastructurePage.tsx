'use client';

import React from 'react';
import { Database, Box, ArrowRightLeft, Cloud, Server } from 'lucide-react';
import Link from 'next/link';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';
import { CallToAction } from '../molecules/CallToAction';
import { InfrastructureSdkCodeBlock } from '../molecules/InfrastructureSdkCodeBlock';
import { useMarketingSiteCopy } from '@/components/marketing/MarketingCopyVariantProvider';

export default function InfrastructurePage() {
  const { copy, withCopy } = useMarketingSiteCopy();
  return (
    <>
      {/* Hero */}
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-20 lg:px-16 lg:py-28 text-center flex flex-col items-center">
          <Text variant="micro" className="mb-6">{copy.infraOverview.hero.micro}</Text>
          <Heading level={1} className="mb-8 max-w-3xl">
            {copy.infraOverview.hero.title}
          </Heading>
          <Text variant="p" className="max-w-2xl">
            {copy.infraOverview.hero.subtitle}
          </Text>
        </Container>
      </Section>

      {/* System Architecture */}
      <Section className="transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Text Explanations */}
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border transition-colors">
              <Text variant="micro" className="mb-6">{copy.infraOverview.architecture.micro}</Text>
              <Heading level={2} className="mb-12">{copy.infraOverview.architecture.heading}</Heading>
              
              <div className="space-y-10">
                <Link href={withCopy('/infrastructure/clients-backend')} className="block group p-4 -m-4 rounded-sm hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rotate-45 bg-zinc-400 dark:bg-zinc-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors"></div>
                    <h3 className="text-black dark:text-white font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {copy.infraOverview.sdkCard.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                      {copy.infraOverview.sdkCard.body}
                    </p>
                  </div>
                </Link>

                <Link href={withCopy('/infrastructure/rails-api')} className="block group p-4 -m-4 rounded-sm hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rotate-45 bg-black dark:bg-white group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors"></div>
                    <h3 className="text-black dark:text-white font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {copy.infraOverview.apiCard.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                      {copy.infraOverview.apiCard.body}
                    </p>
                  </div>
                </Link>

                <Link href={withCopy('/infrastructure/database')} className="block group p-4 -m-4 rounded-sm hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rotate-45 bg-emerald-600 dark:bg-emerald-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors"></div>
                    <h3 className="text-black dark:text-white font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {copy.infraOverview.dbCard.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                      {copy.infraOverview.dbCard.body}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right: The Diagram */}
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center items-center font-mono text-xs overflow-hidden transition-colors">
              <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                
                {/* Client Apps */}
                <Link href={withCopy('/infrastructure/clients-backend')} className="w-full border border-dashed structural-border p-4 text-center bg-white dark:bg-[#0a0a0a] shadow-lg dark:shadow-sm relative group hover:border-emerald-500 transition-colors block">
                  <div className="text-black dark:text-white font-medium mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">SDK</div>
                  <div className="text-[10px] text-zinc-500">{copy.infraOverview.diagram.sdkSub}</div>
                </Link>
                
                <div className="flex flex-col items-center w-full my-2 relative">
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="w-2 h-2 border border-zinc-400 dark:border-zinc-500 bg-white dark:bg-black rotate-45 -my-1 z-10 transition-colors"></div>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 dark:text-zinc-600 transition-colors">REST</div>
                </div>
                
                {/* NGINX Gateway */}
                <Link href={withCopy('/infrastructure/rails-api')} className="w-full border border-zinc-300 dark:border-zinc-700 p-3 text-center bg-zinc-100 dark:bg-[#111] text-black dark:text-white shadow-xl dark:shadow-md relative z-10 transition-colors hover:border-emerald-500 block group">
                  <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">NGINX Gateway</span>
                </Link>
                
                <div className="flex flex-col items-center w-full my-2">
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="w-2 h-2 border border-zinc-400 dark:border-zinc-500 bg-white dark:bg-black rotate-45 -my-1 z-10 transition-colors"></div>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                </div>

                {/* rails core diagram box */}
                <Link href={withCopy('/infrastructure/rails-api')} className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 relative shadow-2xl dark:shadow-xl hover:border-emerald-500 transition-colors block group">
                  <div className="absolute top-0 left-0 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[9px] uppercase tracking-widest text-black dark:text-white font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    rails core
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-3 relative">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">
                      {/* Users */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-3 sm:p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                        <div className="text-[10px] text-zinc-500 mb-1">service</div>
                        <div className="text-zinc-600 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors text-[11px] sm:text-xs">Users</div>
                      </div>

                      {/* Accounts */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-3 sm:p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                        <div className="text-[10px] text-zinc-500 mb-1">service</div>
                        <div className="text-zinc-600 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors text-[11px] sm:text-xs">Accounts</div>
                      </div>

                      {/* Audit */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-3 sm:p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                        <div className="text-[10px] text-zinc-500 mb-1">service</div>
                        <div className="text-zinc-600 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors text-[11px] sm:text-xs">Audit</div>
                      </div>
                    </div>

                    {/* gRPC mesh: same border-dashed style as the “gRPC Mesh” flanks (CSS, not SVG stroke) */}
                    <div className="relative w-full pointer-events-none z-0 -my-0.5 flex flex-col items-stretch" aria-hidden>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="flex justify-center">
                          <div className="h-6 w-0 border-l border-dashed border-zinc-300 dark:border-zinc-600 transition-colors" />
                        </div>
                        <div className="flex justify-center">
                          <div className="h-6 w-0 border-l border-dashed border-zinc-300 dark:border-zinc-600 transition-colors" />
                        </div>
                        <div className="flex justify-center">
                          <div className="h-6 w-0 border-l border-dashed border-zinc-300 dark:border-zinc-600 transition-colors" />
                        </div>
                      </div>
                      <div className="h-0 w-full border-t border-dashed border-zinc-300 dark:border-zinc-600 transition-colors" />
                      <div className="flex justify-center">
                        <div className="h-5 w-0 border-l border-dashed border-zinc-300 dark:border-zinc-600 transition-colors" />
                      </div>
                    </div>

                    {/* Ledger */}
                    <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#0a0a0a] p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors relative z-10">
                      <div className="text-[10px] text-zinc-500 mb-1">service</div>
                      <div className="text-black dark:text-white font-medium transition-colors">Ledger Engine</div>
                    </div>
                  </div>

                  <div className="mt-5 text-center text-[10px] text-zinc-500 dark:text-zinc-600 flex items-center justify-center gap-2 transition-colors">
                    <span className="w-4 border-t border-dashed border-zinc-300 dark:border-zinc-600 transition-colors"></span>
                    <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">gRPC Mesh</span>
                    <span className="w-4 border-t border-dashed border-zinc-300 dark:border-zinc-600 transition-colors"></span>
                  </div>
                </Link>

                <div className="flex flex-col items-center w-full my-2">
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="w-2 h-2 border border-zinc-400 dark:border-zinc-500 bg-white dark:bg-black rotate-45 -my-1 z-10 transition-colors"></div>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                </div>

                {/* Database */}
                <Link href={withCopy('/infrastructure/database')} className="w-full border border-dashed structural-border p-4 text-center bg-zinc-50 dark:bg-[#020202] text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 transition-colors group block">
                  <span className="block text-black dark:text-white mb-1 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Database</span>
                  <span className="text-[10px] text-zinc-500">{copy.infraOverview.diagram.dbSub}</span>
                </Link>

              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Core Concepts */}
      <Section className="transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* The Ledger */}
            <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-900 transition-colors">
              <div className="w-12 h-12 border structural-border bg-white dark:bg-black flex items-center justify-center mb-8 transition-colors">
                <span className="material-symbols-sharp text-black dark:text-white transition-colors"    style={{ fontSize: '1.25rem' }}>database</span>
              </div>
              <h2 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">{copy.infraOverview.coreConcepts[0].title}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-6 transition-colors">
                {copy.infraOverview.coreConcepts[0].body}
              </p>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 p-4 font-mono text-xs text-zinc-500 bg-white dark:bg-black transition-colors">
                Account A: -$50.00
                <br />
                Account B: +$50.00
                <br />
                <span className="text-zinc-300 dark:text-zinc-700 transition-colors">------------------</span>
                <br />
                Total Change: $0.00
              </div>
            </div>

            {/* Accounts */}
            <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-900 transition-colors">
              <div className="w-12 h-12 border structural-border bg-white dark:bg-black flex items-center justify-center mb-8 transition-colors">
                <span className="material-symbols-sharp text-black dark:text-white transition-colors"    style={{ fontSize: '1.25rem' }}>inventory_2</span>
              </div>
              <h2 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">{copy.infraOverview.coreConcepts[1].title}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-6 transition-colors">
                {copy.infraOverview.coreConcepts[1].body}
              </p>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 p-4 font-mono text-xs text-zinc-500 bg-white dark:bg-black transition-colors">
                Name: "Main Checking"
                <br />
                Type: User Account
                <br />
                Balance: $1,250.00
                <br />
                Status: Active
              </div>
            </div>

            {/* Transactions */}
            <div className="p-8 lg:p-12">
              <div className="w-12 h-12 border structural-border bg-white dark:bg-black flex items-center justify-center mb-8 transition-colors">
                <span className="material-symbols-sharp text-black dark:text-white transition-colors"    style={{ fontSize: '1.25rem' }}>sync_alt</span>
              </div>
              <h2 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">{copy.infraOverview.coreConcepts[2].title}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-6 transition-colors">
                {copy.infraOverview.coreConcepts[2].body}
              </p>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 p-4 font-mono text-xs text-zinc-500 bg-white dark:bg-black transition-colors">
                Send: $50.00
                <br />
                From: Acc_A
                <br />
                To: Acc_B
                <br />
                State: Completed
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Code Examples */}
      <Section className="bg-white dark:bg-black transition-colors">
        <Container className="border-x-0 !px-0">
          {/* Example 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 border-b structural-border">
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border">
              <h3 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">{copy.infraOverview.codeAccount.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-light mb-6 transition-colors">
                {copy.infraOverview.codeAccount.p1}
              </p>
              <p className="text-zinc-500 text-sm">
                {copy.infraOverview.codeAccount.p2}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center transition-colors">
              <InfrastructureSdkCodeBlock operation="account" />
            </div>
          </div>

          {/* Example 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border">
              <h3 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">{copy.infraOverview.codeTransfer.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-light mb-6 transition-colors">
                {copy.infraOverview.codeTransfer.p1}
              </p>
              <p className="text-zinc-500 text-sm">
                {copy.infraOverview.codeTransfer.p2}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center transition-colors">
              <InfrastructureSdkCodeBlock operation="transfer" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer CTA */}
      <CallToAction />
    </>
  );
}
