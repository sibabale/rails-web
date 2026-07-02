import React from 'react';
import { theme } from '@/lib/marketingTheme';

export function Section({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={`${theme.layout.section} ${className}`} {...props}>
      {children}
    </section>
  );
}
