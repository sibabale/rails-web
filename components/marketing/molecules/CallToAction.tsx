'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Section } from '../atoms/Section';
import { Container } from '../atoms/Container';
import { Heading } from '../atoms/Heading';
import { Button } from '../atoms/Button';

export function CallToAction({
  title = 'Start building financial products on trusted rails.',
}: {
  title?: string;
}) {
  const router = useRouter();
  return (
    <Section>
      <Container className="px-8 py-24 text-center flex flex-col items-center">
        <Heading level={2} className="mb-8">
          {title}
        </Heading>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" className="px-8" onClick={() => router.push('/login')}>
            Get Started{' '}
            <span className="material-symbols-sharp ml-2" style={{ fontSize: '1rem' }}>
              arrow_forward
            </span>
          </Button>
          <Button variant="secondary" className="px-8" type="button">
            Read Documentation
          </Button>
        </div>
      </Container>
    </Section>
  );
}
