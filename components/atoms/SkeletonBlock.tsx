'use client';

import type { CSSProperties } from 'react';

interface SkeletonBlockProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
  ariaLabel?: string;
}

export default function SkeletonBlock({
  width = '100%',
  height = '0.75rem',
  className = '',
  rounded = false,
  ariaLabel,
}: SkeletonBlockProps) {
  const style: CSSProperties = { width, height };
  return (
    <span
      data-testid="skeleton-block"
      role={ariaLabel ? 'status' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={`inline-block animate-pulse bg-zinc-200 align-middle dark:bg-zinc-800 ${
        rounded ? 'rounded-full' : ''
      } ${className}`}
      style={style}
    />
  );
}
