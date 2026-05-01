import React from 'react';
import { theme } from '@/lib/marketingTheme';

interface HeadingProps {
  level?: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

export function Heading({ level = 2, className = '', children, 'data-testid': dataTestId }: HeadingProps) {
  const Component = `h${level}` as React.ElementType;
  const headingClass = theme.typography[`h${level}` as keyof typeof theme.typography];
  return (
    <Component className={`${headingClass} ${className}`} data-testid={dataTestId}>
      {children}
    </Component>
  );
}
