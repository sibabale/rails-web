'use client';

import React from 'react';
import { ArrowLeft, Cpu, Wallet, Users, BookOpen, Network } from 'lucide-react';
import Link from 'next/link';
import ArchitectureDiagram from '../../ArchitectureDiagram';
import { CallToAction } from '../../molecules/CallToAction';
import { Section } from '../../atoms/Section';
import { Container } from '../../atoms/Container';
import { Heading } from '../../atoms/Heading';
import { Text } from '../../atoms/Text';

export default function RailsApi() {
  return (
    <div className="flex flex-col">
      <Section className="bg-zinc-50 dark:bg-[#020202] transition-colors">
        <Container className="px-8 py-16 lg:px-16 lg:py-24">
          <Link href="/infrastructure" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
            <span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>arrow_back</span> Back to Infrastructure
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Text variant="micro" className="mb-6">Architecture Deep Dive</Text>
              <Heading level={1} className="mb-8 leading-[1.1]">Rails API & Microservices</Heading>
              <Text variant="p" className="!text-xl">
                We use a strict microservices architecture that prioritizes safety for the ledger and raw performance for high-read components like Accounts and Users.
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
        <div className="prose dark:prose-invert prose-zinc max-w-3xl">
          <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
            <span className="material-symbols-sharp text-zinc-500"    style={{ fontSize: '1.5rem' }}>memory</span>
            The Segregated Engine
          </Heading>
          <Text variant="p" className="mb-6">
            Incoming traffic first reaches an <strong>NGINX Gateway</strong>. This layer handles SSL termination, global rate limiting, and intelligent routing. It acts as the shield before any traffic enters the core Rails environment.
          </Text>
          
          <Text variant="p" className="mb-8">
            Inside the Rails API enclosure, responsibilities are logically and physically split by runtime constraint:
          </Text>
          
          <div className="space-y-6">
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                <span className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"    style={{ fontSize: '1.25rem' }}>account_balance_wallet</span>
              </div>
              <div>
                <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">Accounts <span className="text-zinc-500 text-base font-mono ml-2">(Rust)</span></h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">
                  Houses core bank account infrastructure and high-volume transaction routing logic. Built in Rust to guarantee memory safety, avoid garbage collection pauses, and achieve sub-millisecond response times at massive scale.
                </p>
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                <span className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"    style={{ fontSize: '1.25rem' }}>group</span>
              </div>
              <div>
                <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">Users <span className="text-zinc-500 text-base font-mono ml-2">(Rust)</span></h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">
                  Manages customer identity, complex authentication patterns, and authorization. Separated from the Accounts layer to allow independent scaling for high-read identity verification checks.
                </p>
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                <span className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"    style={{ fontSize: '1.25rem' }}>menu_book</span>
              </div>
              <div>
                <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">The Ledger <span className="text-zinc-500 text-base font-mono ml-2">(Rails)</span></h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">
                  Transaction commits require complex relational consistency, ACID guarantees, and battle-tested ORM reliability. We lean on the maturity of Ruby on Rails and ActiveRecord to ensure the double-entry engine behaves predictably and never drops a cent.
                </p>
              </div>
            </div>

            <div className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 flex items-start gap-4 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black flex items-center justify-center shrink-0 group-hover:border-emerald-600/50 dark:group-hover:border-emerald-500/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                <span className="material-symbols-sharp text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"    style={{ fontSize: '1.25rem' }}>lan</span>
              </div>
              <div>
                <h3 className="text-xl text-black dark:text-white font-medium mb-2 mt-1 transition-colors">Internal Mesh <span className="text-zinc-500 text-base font-mono ml-2">(gRPC)</span></h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-0 transition-colors">
                  Services do not communicate internally over HTTP/REST. They use a strict, schema-validated gRPC mesh, meaning data shapes are formally guaranteed across languages and internal network latency is virtually non-existent.
                </p>
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
