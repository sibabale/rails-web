'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { CallToAction } from '../molecules/CallToAction';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';
import { startLandingTracking } from '@/lib/analytics';
import { getMarketingDocsHref } from '@/lib/env';
import { theme } from '@/lib/marketingTheme';

type SdkType = 'TypeScript' | 'Go' | 'Java' | 'Kotlin' | '.NET';

export default function MarketingHome() {
  const docsHref = getMarketingDocsHref();

  useEffect(() => {
    startLandingTracking();
  }, []);
  const [activeSdk, setActiveSdk] = useState<SdkType>('TypeScript');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sdkOptions: SdkType[] = ['TypeScript', 'Go', 'Java', 'Kotlin', '.NET'];

  const getCodeSample = () => {
    switch (activeSdk) {
      case 'TypeScript':
        return (
          <>
<span className="text-purple-400">import</span> {'{ '}Rails{' }'} <span className="text-purple-400">from</span> <span className="text-yellow-300">'@rails/sdk'</span>;<br /><br />
<span className="text-purple-400">const</span> rails = <span className="text-purple-400">new</span> <span className="text-blue-300">Rails</span>(process.<span className="text-blue-300">env</span>.RAILS_KEY);<br /><br />
<span className="text-purple-400">const</span> entry = <span className="text-purple-400">await</span> rails.ledger.<span className="text-blue-300">commit</span>({'{'}<br />
<span className="text-emerald-400">  amount</span>: <span className="text-purple-300">5000</span>,<br />
<span className="text-emerald-400">  source</span>: <span className="text-yellow-300">'acc_checking_123'</span>,<br />
<span className="text-emerald-400">  destination</span>: <span className="text-yellow-300">'acc_savings_456'</span>,<br />
<span className="text-emerald-400">  description</span>: <span className="text-yellow-300">'Monthly Savings Deposit'</span><br />
{'}'});
          </>
        );
      case 'Go':
        return (
          <>
<span className="text-purple-400">import</span> <span className="text-yellow-300">"github.com/rails/rails-go"</span><br /><br />
client := rails.<span className="text-blue-300">NewClient</span>(os.<span className="text-blue-300">Getenv</span>(<span className="text-yellow-300">"RAILS_KEY"</span>))<br /><br />
entry, err := client.Ledger.<span className="text-blue-300">Commit</span>(context.<span className="text-blue-300">Background</span>(), &rails.CommitParams{'{'}<br />
<span className="text-emerald-400">  Amount</span>:      <span className="text-purple-300">5000</span>,<br />
<span className="text-emerald-400">  Source</span>:      <span className="text-yellow-300">"acc_checking_123"</span>,<br />
<span className="text-emerald-400">  Destination</span>: <span className="text-yellow-300">"acc_savings_456"</span>,<br />
<span className="text-emerald-400">  Description</span>: <span className="text-yellow-300">"Monthly Savings Deposit"</span>,<br />
{'}'})
          </>
        );
      case 'Java':
        return (
          <>
<span className="text-purple-400">import</span> com.rails.RailsClient;<br /><br />
RailsClient rails = RailsClient.<span className="text-blue-300">builder</span>()<br />
    .<span className="text-blue-300">apiKey</span>(System.<span className="text-blue-300">getenv</span>(<span className="text-yellow-300">"RAILS_KEY"</span>))<br />
    .<span className="text-blue-300">build</span>();<br /><br />
LedgerEntry entry = rails.<span className="text-blue-300">ledger</span>().<span className="text-blue-300">commit</span>(CommitParams.<span className="text-blue-300">builder</span>()<br />
<span className="text-emerald-400">    .amount</span>(<span className="text-purple-300">5000</span>)<br />
<span className="text-emerald-400">    .source</span>(<span className="text-yellow-300">"acc_checking_123"</span>)<br />
<span className="text-emerald-400">    .destination</span>(<span className="text-yellow-300">"acc_savings_456"</span>)<br />
<span className="text-emerald-400">    .description</span>(<span className="text-yellow-300">"Monthly Savings Deposit"</span>)<br />
    .<span className="text-blue-300">build</span>());
          </>
        );
      case 'Kotlin':
        return (
          <>
<span className="text-purple-400">import</span> com.rails.RailsClient<br /><br />
<span className="text-purple-400">val</span> rails = <span className="text-blue-300">RailsClient</span>(System.<span className="text-blue-300">getenv</span>(<span className="text-yellow-300">"RAILS_KEY"</span>))<br /><br />
<span className="text-purple-400">val</span> entry = rails.ledger.<span className="text-blue-300">commit</span>(<br />
<span className="text-emerald-400">    amount</span> = <span className="text-purple-300">5000</span>,<br />
<span className="text-emerald-400">    source</span> = <span className="text-yellow-300">"acc_checking_123"</span>,<br />
<span className="text-emerald-400">    destination</span> = <span className="text-yellow-300">"acc_savings_456"</span>,<br />
<span className="text-emerald-400">    description</span> = <span className="text-yellow-300">"Monthly Savings Deposit"</span><br />
)
          </>
        );
      case '.NET':
        return (
          <>
<span className="text-purple-400">using</span> Rails.Sdk;<br /><br />
<span className="text-purple-400">var</span> rails = <span className="text-purple-400">new</span> <span className="text-blue-300">RailsClient</span>(Environment.<span className="text-blue-300">GetEnvironmentVariable</span>(<span className="text-yellow-300">"RAILS_KEY"</span>));<br /><br />
<span className="text-purple-400">var</span> entry = <span className="text-purple-400">await</span> rails.Ledger.<span className="text-blue-300">CommitAsync</span>(<span className="text-purple-400">new</span> <span className="text-blue-300">CommitParams</span> {'{'}<br />
<span className="text-emerald-400">    Amount</span> = <span className="text-purple-300">5000</span>,<br />
<span className="text-emerald-400">    Source</span> = <span className="text-yellow-300">"acc_checking_123"</span>,<br />
<span className="text-emerald-400">    Destination</span> = <span className="text-yellow-300">"acc_savings_456"</span>,<br />
<span className="text-emerald-400">    Description</span> = <span className="text-yellow-300">"Monthly Savings Deposit"</span><br />
{'}'});
          </>
        );
    }
  };

  return (
    <>
      {/* Section: Hero */}
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors relative border-b structural-border">
        <Container className="px-8 py-24 lg:px-16 lg:py-32 text-center flex flex-col items-center">
          <Text variant="micro" className="mb-8 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
            v2.0.0 Now Available
          </Text>
          <Heading level={1} className="mb-8 max-w-4xl">
            Open-source banking rails <br className="hidden md:block" />
            for modern finance.
          </Heading>
          <Text variant="p" className="mb-10 max-w-2xl mx-auto">
            Build accounts, wallets, ledgers, and money movement systems faster—with Rust-grade performance and bank-grade integrity.
          </Text>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <Link
              href="/login"
              data-testid="marketing-get-started-hero"
              className={`px-6 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${theme.buttons.primary}`}
            >
              Get Started{' '}
              <span className="material-symbols-sharp ml-2" style={{ fontSize: '1rem' }}>
                arrow_forward
              </span>
            </Link>
            <Link
              href={docsHref}
              data-testid="marketing-read-docs-hero"
              className={`px-6 py-3 text-sm inline-flex items-center justify-center gap-2 rounded-none ${theme.buttons.secondary}`}
            >
              <span className="material-symbols-sharp mr-2" style={{ fontSize: '1rem' }}>
                menu_book
              </span>
              <span>Read Docs</span>
            </Link>
          </div>

          {/* Terminal / Code / Architecture Block */}
          <div className="w-full max-w-5xl text-left bg-zinc-50 dark:bg-[#050505] p-2 lg:p-4 rounded-sm shadow-2xl relative overflow-hidden transition-colors border structural-border border-b-0 -mb-28 lg:-mb-40 z-10">
            {/* Minimal terminal window */}
            <div className="border structural-border bg-white dark:bg-black w-full shadow-lg dark:shadow-2xl transition-colors rounded-t-sm">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b structural-border bg-zinc-100 dark:bg-[#0a0a0a] transition-colors rounded-t-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 transition-colors"></div>
                  <div className="w-2.5 h-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 transition-colors"></div>
                  <div className="w-2.5 h-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 transition-colors"></div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-sm shadow-sm dark:shadow-none"
                  >
                    {activeSdk} Example <span className={`material-symbols-sharp transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ fontSize: '0.75rem' }}>expand_more</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1 rounded-sm shadow-xl z-50 min-w-[120px]">
                      {sdkOptions.map(sdk => (
                        <button
                          key={sdk}
                          onClick={() => {
                            setActiveSdk(sdk);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 font-mono text-[10px] transition-colors ${activeSdk === sdk ? 'text-black dark:text-white bg-zinc-100 dark:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                        >
                          {sdk}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Code */}
              <div className="p-6 overflow-x-auto min-h-[300px]">
                <pre className="font-mono text-[13px] leading-relaxed">
                  <code className="text-zinc-800 dark:text-zinc-400">
                    {getCodeSample()}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Section: Problem / Why Rails */}
      <Section className="bg-white dark:bg-black transition-colors pt-32 lg:pt-48">
        <Container className="px-8 pb-24 lg:px-16 lg:pb-32 flex flex-col items-center text-center">
          <span className="material-symbols-sharp text-black dark:text-white mb-6 transition-colors"    style={{ fontSize: '2rem' }}>shield</span>
          <Heading level={2} className="mb-6 max-w-2xl">
            Most teams underestimate how hard banking systems are.
          </Heading>
          <Text variant="p" className="max-w-3xl">
            Building financial backends internally usually means years spent on ledger correctness, reconciliation bugs, audit trails, race conditions, and compliance foundations. 
            <span className="text-black dark:text-white transition-colors"> Rails gives teams a hardened starting point.</span>
          </Text>
        </Container>
      </Section>

      {/* Section: Modules Grid */}
      <Section className="transition-colors" id="infrastructure">
        <Container className="!px-0 border-x-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: 'database', title: "Double Entry Ledger", desc: "Every movement balanced and traceable down to the micro-cent." },
              { icon: 'inventory_2', title: "Accounts Engine", desc: "Create and structure customer, business, and system operating accounts." },
              { icon: 'shield', title: "Users & Identity", desc: "Organizations, extremely granular permissions, and access controls." },
              { icon: 'layers', title: "Wallet Infrastructure", desc: "Stored value, dynamic balances, and programmatic transfers." },
              { icon: 'monitoring', title: "Event System", desc: "Reliable webhooks and real-time sync for external system integration." },
              { icon: 'code', title: "SDK Ecosystem", desc: "Ship faster in your native language with officially supported clients." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 border-b md:border-b-0 md:[&:not(:nth-last-child(-n+3))]:border-b lg:[&:not(:nth-last-child(-n+3))]:border-b lg:border-r border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors group">
                <div className="w-10 h-10 border structural-border bg-white dark:bg-black flex items-center justify-center mb-6 group-hover:border-zinc-400 dark:group-hover:border-zinc-700 transition-colors">
                  <span className="material-symbols-sharp text-black dark:text-white transition-colors" style={{ fontSize: '1rem' }}>{feature.icon}</span>
                </div>
                <h3 className="text-lg text-black dark:text-white font-medium mb-3 transition-colors">{feature.title}</h3>
                <Text variant="p" className="!text-zinc-600 dark:!text-zinc-500 !text-sm !leading-relaxed">{feature.desc}</Text>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section: OSS / Security */}
      <Section className="bg-zinc-50 dark:bg-[#030303] transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 border-l border-r structural-border">
            <div className="p-8 lg:p-16 border-b lg:border-b-0 lg:border-r structural-border flex flex-col justify-center">
              <Text variant="micro" className="mb-6">Open Source</Text>
              <Heading level={2} className="!text-2xl sm:!text-3xl mb-6">Infrastructure you can inspect, trust, and extend.</Heading>
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-zinc-400 dark:text-zinc-600"    style={{ fontSize: '1rem' }}>lock</span> No black box vendor lock-in</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-zinc-400 dark:text-zinc-600"    style={{ fontSize: '1rem' }}>code</span> Full source visibility</li>
                <li className="flex gap-3"><span className="material-symbols-sharp shrink-0 text-zinc-400 dark:text-zinc-600"    style={{ fontSize: '1rem' }}>inventory_2</span> Self-host anywhere via Docker</li>
                <li className="flex gap-3"><SiGithub className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-600" /> Forkable long-term resilience</li>
              </ul>
            </div>
            
            {/* Architecture Diagram */}
            <div className="p-8 lg:p-16 bg-white dark:bg-black flex flex-col justify-center font-mono text-xs transition-colors">
              <Text variant="micro" className="mb-8">Architecture Overview</Text>
              
              <div className="flex flex-col items-center text-zinc-500 w-full max-w-sm mx-auto">
                <div className="w-full border border-dashed structural-border p-4 text-center bg-zinc-50 dark:bg-[#0a0a0a] text-black dark:text-white shadow-lg dark:shadow-2xl transition-colors">SDK</div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 my-1 transition-colors"></div>
                <div className="w-full border border-zinc-400 dark:border-zinc-700 p-4 text-center bg-zinc-100 dark:bg-[#111] text-black dark:text-white transition-colors">Rails API Layer (Rust)</div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 my-1 transition-colors"></div>
                <div className="w-full border structural-border p-4 flex justify-between bg-zinc-50 dark:bg-[#0a0a0a] transition-colors">
                  <span className="text-zinc-600 dark:text-zinc-300">Ledger</span>
                  <span className="text-zinc-600 dark:text-zinc-300">Accounts</span>
                  <span className="text-zinc-600 dark:text-zinc-300">Wallets</span>
                </div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 my-1 transition-colors"></div>
                <div className="w-full border border-dashed structural-border p-4 text-center bg-white dark:bg-black transition-colors">Database</div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Section: CTA */}
      <div id="beta">
        <CallToAction />
      </div>
    </>
  );
}
