'use client';

interface SpinnerProps {
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export default function Spinner({ size = 14, className = '', ariaLabel }: SpinnerProps) {
  return (
    <span
      role={ariaLabel ? 'status' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={`inline-block animate-spin rounded-full border-2 border-zinc-300/40 border-t-current ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
