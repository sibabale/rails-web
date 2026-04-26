'use client';

import React from 'react';
import { ArrowLeft, Database } from 'lucide-react';
import Link from 'next/link';
import ArchitectureDiagram from '../../ArchitectureDiagram';
import { CallToAction } from '../../molecules/CallToAction';
import { Section } from '../../atoms/Section';
import { Container } from '../../atoms/Container';
import { Heading } from '../../atoms/Heading';
import { Text } from '../../atoms/Text';

export default function InfrastructureDatabase() {
  return (
    <div className="flex flex-col">
      <Section className="bg-zinc-50 dark:bg-[#020202]">
        <Container className="px-8 py-16 lg:px-16 lg:py-24">
          <Link href="/infrastructure" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
            <span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>arrow_back</span> Back to Infrastructure
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Text variant="micro" className="mb-6">Architecture Deep Dive</Text>
              <Heading level={1} className="mb-8 leading-[1.1]">PostgreSQL</Heading>
              <Text variant="p" className="!text-xl">
                We don't force you into a proprietary cloud database. Your financial data is yours, and you should be able to store it in the database ecosystem you already trust.
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
        <div className="prose dark:prose-invert prose-zinc max-w-3xl">
          <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
            <span className="material-symbols-sharp text-zinc-500"    style={{ fontSize: '1.5rem' }}>database</span>
            Bring Your Own Database
          </Heading>
          <Text variant="p" className="mb-6">
            Because our entire state layer is driven by pure, standard SQL migrations, you can plug the Rails engine into almost any standard Postgres provider. 
            Need serverless auto-scaling? Connect <strong>Neon</strong>. Prefer an integrated backend-as-a-service? Connect <strong>Supabase</strong>. Want maximum enterprise control? Run it on <strong>AWS RDS</strong> or bare metal.
          </Text>
          

        </div>
        </Container>
      </Section>
      
      <CallToAction />
    </div>
  );
}
