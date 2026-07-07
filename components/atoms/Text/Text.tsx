import React from 'react';
import { theme } from '@/lib/marketingTheme';

interface TextProps {
  variant?: 'p' | 'micro';
  className?: string;
  children: React.ReactNode;
}

export function Text({ variant = 'p', className = '', children }: TextProps) {
  const textClass = theme.typography[variant];
  const Component = variant === 'p' ? 'p' : 'div';
  return (
    <Component className={`${textClass} ${className}`}>
      {children}
    </Component>
  );
}
