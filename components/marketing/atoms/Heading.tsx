import React from 'react';
import { theme } from '@/lib/marketingTheme';

interface HeadingProps {
  level?: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}

export function Heading({ level = 2, className = '', children }: HeadingProps) {
  const Component = `h${level}` as React.ElementType;
  const headingClass = theme.typography[`h${level}` as keyof typeof theme.typography];
  return (
    <Component className={`${headingClass} ${className}`}>
      {children}
    </Component>
  );
}
