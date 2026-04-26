'use client';

import React from 'react';
import { Database, Box, ArrowRightLeft, Cloud, Server } from 'lucide-react';
import Link from 'next/link';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { Text } from '../atoms/Text';
import { CallToAction } from '../molecules/CallToAction';

export default function InfrastructurePage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-20 lg:px-16 lg:py-28 text-center flex flex-col items-center">
          <Text variant="micro" className="mb-6">Infrastructure Overview</Text>
          <Heading level={1} className="mb-8 max-w-3xl">
            A reliable source of truth <br />
            for money movement.
          </Heading>
          <Text variant="p" className="max-w-2xl">
            Rails provides a robust foundation for building stable financial applications. By enforcing strict double-entry accounting at the deepest layer, we ensure absolute consistency across every balance.
          </Text>
        </Container>
      </Section>

      {/* System Architecture */}
      <Section className="transition-colors">
        <Container className="border-x-0 !px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Text Explanations */}
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border transition-colors">
              <Text variant="micro" className="mb-6">System Architecture</Text>
              <Heading level={2} className="mb-12">How it fits together</Heading>
              
              <div className="space-y-10">
                <Link href="/infrastructure/clients-backend" className="block group p-4 -m-4 rounded-sm hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rotate-45 bg-zinc-400 dark:bg-zinc-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors"></div>
                    <h3 className="text-black dark:text-white font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Backend SDKs
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                      <strong>Server-to-server only.</strong> Integrate securely using our official SDKs. Direct frontend connections are intentionally blocked for security.
                    </p>
                  </div>
                </Link>

                <Link href="/infrastructure/rails-api" className="block group p-4 -m-4 rounded-sm hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rotate-45 bg-black dark:bg-white group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors"></div>
                    <h3 className="text-black dark:text-white font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Rails API
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed mb-3 transition-colors">
                      We use a strict microservices architecture. Incoming traffic hits an <strong>NGINX Gateway</strong> that talks to your frontends or backends, which then routes inside the Rails API rectangle:
                    </p>
                    <ul className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed list-disc pl-5 space-y-1 transition-colors">
                      <li><strong>Accounts</strong> and <strong>Users</strong> run as separate microservices in <strong>Rust</strong>.</li>
                      <li>The <strong>Ledger</strong> operates on battle-tested <strong>Rails</strong>.</li>
                      <li>They communicate securely using <strong>gRPC</strong>.</li>
                    </ul>
                  </div>
                </Link>

                <Link href="/infrastructure/database" className="block group p-4 -m-4 rounded-sm hover:bg-zinc-50 dark:hover:bg-[#050505] transition-colors">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rotate-45 bg-emerald-600 dark:bg-emerald-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-colors"></div>
                    <h3 className="text-black dark:text-white font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      PostgreSQL
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed transition-colors">
                      You can bring your own database provider. All of our structural migrations are purely SQL, so you can seamlessly plug in <strong>Neon</strong>, <strong>Supabase</strong>, or whatever else you prefer.
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right: The Diagram */}
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center items-center font-mono text-xs overflow-hidden transition-colors">
              <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                
                {/* Client Apps */}
                <Link href="/infrastructure/clients-backend" className="w-full border border-dashed structural-border p-4 text-center bg-white dark:bg-[#0a0a0a] shadow-lg dark:shadow-sm relative group hover:border-emerald-500 transition-colors block">
                  <div className="text-black dark:text-white font-medium mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">SDK</div>
                  <div className="text-[10px] text-zinc-500">Official SDKs or direct integration</div>
                </Link>
                
                <div className="flex flex-col items-center w-full my-2 relative">
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="w-2 h-2 border border-zinc-400 dark:border-zinc-500 bg-white dark:bg-black rotate-45 -my-1 z-10 transition-colors"></div>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 dark:text-zinc-600 transition-colors">REST / GraphQL</div>
                </div>
                
                {/* NGINX Gateway */}
                <Link href="/infrastructure/rails-api" className="w-full border border-zinc-300 dark:border-zinc-700 p-3 text-center bg-zinc-100 dark:bg-[#111] text-black dark:text-white shadow-xl dark:shadow-md relative z-10 transition-colors hover:border-emerald-500 block group">
                  <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">NGINX Gateway</span>
                </Link>
                
                <div className="flex flex-col items-center w-full my-2">
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                  <div className="w-2 h-2 border border-zinc-400 dark:border-zinc-500 bg-white dark:bg-black rotate-45 -my-1 z-10 transition-colors"></div>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 transition-colors"></div>
                </div>

                {/* Rails API Box */}
                <Link href="/infrastructure/rails-api" className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 relative shadow-2xl dark:shadow-xl hover:border-emerald-500 transition-colors block group">
                  <div className="absolute top-0 left-0 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[9px] uppercase tracking-widest text-black dark:text-white font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    Rails API
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-5 relative">
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      {/* Users */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                        <div className="text-[10px] text-zinc-500 mb-1">Rust</div>
                        <div className="text-zinc-600 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">Users</div>
                      </div>
                      
                      {/* Dotted horizontal line */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 border-t border-dashed border-zinc-300 dark:border-zinc-600 transition-colors"></div>
                      
                      {/* Accounts */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                        <div className="text-[10px] text-zinc-500 mb-1">Rust</div>
                        <div className="text-zinc-600 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">Accounts</div>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                      <div className="h-full w-px border-l border-dashed border-zinc-300 dark:border-zinc-600 transition-colors"></div>
                    </div>

                    {/* Ledger */}
                    <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#0a0a0a] p-4 text-center group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors relative z-10">
                      <div className="text-[10px] text-zinc-500 mb-1">Rails</div>
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
                <Link href="/infrastructure/database" className="w-full border border-dashed structural-border p-4 text-center bg-zinc-50 dark:bg-[#020202] text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 transition-colors group block">
                  <span className="block text-black dark:text-white mb-1 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Database</span>
                  <span className="text-[10px] text-zinc-500">Plug-in Neon, Supabase, etc. (pure SQL migrations)</span>
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
              <h2 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">1. The Ledger</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-6 transition-colors">
                An immutable record of financial truth. The ledger enforces absolute equilibrium: every debit must have an equal credit, ensuring that funds are never stranded or double-counted.
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
              <h2 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">2. Accounts</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-6 transition-colors">
                Logical containers for tracking balances over time. Accounts can map to end-users, external businesses, or complex internal routing states like clearing holds and collected fees.
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
              <h2 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">3. Transfers</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-6 transition-colors">
                Guaranteed atomic state changes. Transfers move funds across accounts instantly and safely. If any part of the execution cannot complete, the entire movement fails cleanly.
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
              <h3 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">Creating an Account</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-light mb-6 transition-colors">
                Initialize ledgers programmatically through the API. Instantly define the core account logic, specify the operating currency, and attach relevant ownership metadata.
              </p>
              <p className="text-zinc-500 text-sm">
                The core engine structures the underlying database state to accept incoming transfers without manual intervention.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center transition-colors">
              <div className="border structural-border bg-white dark:bg-black w-full shadow-lg dark:shadow-xl transition-colors">
                <div className="flex items-center justify-between px-4 py-3 border-b structural-border bg-zinc-100 dark:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-sm transition-colors">POST</div>
                    <div className="font-mono text-[10px] text-zinc-500">/v1/accounts</div>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="font-mono text-[13px] leading-relaxed">
                    <code className="text-zinc-800 dark:text-zinc-300">
{'{'}<br />
<span className="text-emerald-600 dark:text-emerald-400">  "name"</span>: <span className="text-amber-600 dark:text-yellow-300">"User Checking"</span>,<br />
<span className="text-emerald-600 dark:text-emerald-400">  "currency"</span>: <span className="text-amber-600 dark:text-yellow-300">"USD"</span>,<br />
<span className="text-emerald-600 dark:text-emerald-400">  "metadata"</span>: {'{'}<br />
<span className="text-emerald-600 dark:text-emerald-400">    "user_id"</span>: <span className="text-amber-600 dark:text-yellow-300">"usr_9x8d7"</span><br />
{'  }'}<br />
{'}'}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r structural-border">
              <h3 className="text-2xl text-black dark:text-white font-medium mb-4 transition-colors">Sending a Payment</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-light mb-6 transition-colors">
                Balance mutations are strictly guarded at the transaction layer. Instead of editing balances directly, developers authorize unalterable transfers between specific accounts.
              </p>
              <p className="text-zinc-500 text-sm">
                If an account has insufficient funds to clear, network conditions fail, or authorization is blocked, the entire request safely rejects.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-[#050505] p-8 lg:p-16 flex flex-col justify-center transition-colors">
              <div className="border structural-border bg-white dark:bg-black w-full shadow-lg dark:shadow-xl transition-colors">
                <div className="flex items-center justify-between px-4 py-3 border-b structural-border bg-zinc-100 dark:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-sm transition-colors">POST</div>
                    <div className="font-mono text-[10px] text-zinc-500">/v1/transfers</div>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="font-mono text-[13px] leading-relaxed">
                    <code className="text-zinc-800 dark:text-zinc-300 transition-colors">
{'{'}<br />
<span className="text-emerald-600 dark:text-emerald-400">  "amount"</span>: <span className="text-purple-600 dark:text-purple-300">5000</span>, <span className="text-zinc-400 dark:text-zinc-600">// Amount in cents ($50.00)</span><br />
<span className="text-emerald-600 dark:text-emerald-400">  "source_account_id"</span>: <span className="text-amber-600 dark:text-yellow-300">"acc_checking_123"</span>,<br />
<span className="text-emerald-600 dark:text-emerald-400">  "destination_account_id"</span>: <span className="text-amber-600 dark:text-yellow-300">"acc_savings_456"</span>,<br />
<span className="text-emerald-600 dark:text-emerald-400">  "description"</span>: <span className="text-amber-600 dark:text-yellow-300">"Monthly Savings Deposit"</span><br />
{'}'}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer CTA */}
      <CallToAction title="Ready to build?" />
    </>
  );
}
