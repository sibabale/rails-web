'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ArchitectureDiagram from '../../ArchitectureDiagram';
import { SiTypescript, SiGo, SiKotlin, SiOpenjdk, SiDotnet, SiGithub } from '@icons-pack/react-simple-icons';
import { motion } from 'motion/react';
import { CallToAction } from '../../molecules/CallToAction';
import { Section } from '../../atoms/Section';
import { Container } from '../../atoms/Container';
import { Heading } from '../../atoms/Heading';
import { Text } from '../../atoms/Text';

export default function ClientsBackend() {
  const sdks = [
    { name: 'TypeScript', Icon: SiTypescript, link: 'https://github.com/rails/rails-node' },
    { name: 'Go', Icon: SiGo, link: 'https://github.com/rails/rails-go' },
    { name: 'Kotlin', Icon: SiKotlin, link: 'https://github.com/rails/rails-kotlin' },
    { name: 'Java', Icon: SiOpenjdk, link: 'https://github.com/rails/rails-java' },
    { name: '.NET', Icon: SiDotnet, link: 'https://github.com/rails/rails-dotnet' },
  ];

  const flowSteps = [
    { icon: 'ads_click', text: "User triggers an action on your frontend application." },
    { icon: 'smartphone', text: "Your frontend calls your backend system." },
    { icon: 'settings', text: "Your backend applies your unique business logic, pricing, and rules." },
    { icon: 'terminal', text: "Your backend uses our SDK to instruct the Rails API to move the money.", highlight: true },
    { icon: 'gpp_good', text: "Rails safely executes and records the immutable transaction." },
    { icon: 'database', text: "Transaction state is persisted into the database of your choosing." },
  ];

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
          <Link href="/infrastructure" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
            <span className="material-symbols-sharp "    style={{ fontSize: '1rem' }}>arrow_back</span> Back to Infrastructure
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Text variant="micro" className="mb-6">Architecture Deep Dive</Text>
              <Heading level={1} className="mb-8 leading-[1.1]">Backend SDKs</Heading>
              <Text variant="p" className="!text-xl">
                Your business logic lives in this layer. Every financial product is unique, so we provide the core banking rails while you use your preferred SDK to build the custom rules and workflows that solve your customers' most pressing problems.
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
        <div className="prose dark:prose-invert prose-zinc max-w-3xl">
          <Heading level={2} className="!text-2xl flex items-center gap-3 mt-0 mb-6">
            <span className="material-symbols-sharp text-zinc-500"    style={{ fontSize: '1.5rem' }}>extension</span>
            Where Your Logic Lives
          </Heading>
          <Text variant="p" className="mb-6">
            Because every use case is different, <strong>we don't force business rules into the ledger.</strong>
          </Text>
          <Text variant="p" className="mb-10">
            Instead, your backend handles all the product-specific features—like calculating dynamic pricing, verifying identities, or applying custom risk profiles. Once your backend resolves the logic to solve your pressing problems, it simply tells Rails to safely execute the final ledger movements.
          </Text>

          <div className="mt-20 pt-10 border-t structural-border transition-colors">
            <h3 className="text-black dark:text-white text-2xl font-medium mb-12 transition-colors">The Application Flow</h3>
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

          {/* SDK Links Footer */}
          <div className="mt-20 pt-10 border-t structural-border transition-colors">
            <h3 className="text-lg text-black dark:text-white font-medium mb-8 transition-colors">Official SDK Repositories</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {sdks.map(sdk => {
                const Icon = sdk.Icon;
                return (
                  <a key={sdk.name} href={sdk.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border structural-border p-4 hover:bg-zinc-50 dark:hover:bg-[#050505] hover:border-zinc-400 dark:hover:border-zinc-600 transition-all rounded-sm no-underline group cursor-pointer">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white dark:bg-black border structural-border text-xs font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black dark:text-white m-0 p-0 leading-tight transition-colors">{sdk.name}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5 group-hover:text-zinc-800 dark:group-hover:text-zinc-400 transition-colors">
                        <SiGithub className="w-3 h-3" /> View Source
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>
        </Container>
      </Section>

      <CallToAction />
    </div>
  );
}
