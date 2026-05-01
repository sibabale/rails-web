import React from 'react';
import { theme } from '@/lib/marketingTheme';

export function Container({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${theme.layout.container} ${className}`} {...props}>
      {children}
    </div>
  );
}
