'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ButtonLoadingContent from '@/components/atoms/ButtonLoadingContent/ButtonLoadingContent';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: Tone;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
}

const TONE_CLASSES: Record<Tone, string> = {
  neutral:
    'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-black dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white',
  success:
    'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-black dark:text-emerald-100 dark:hover:bg-emerald-950/50',
  warning:
    'border-amber-300 bg-white text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-black dark:text-amber-100 dark:hover:bg-amber-950/50',
  danger:
    'border-red-300 bg-white text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-black dark:text-red-200 dark:hover:bg-red-950/50',
};

export default function SecondaryButton({
  children,
  tone = 'neutral',
  fullWidth = true,
  className = '',
  type = 'button',
  loading = false,
  loadingText,
  disabled,
  'aria-busy': ariaBusy,
  ...rest
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading ? true : ariaBusy}
      className={`relative inline-flex items-center justify-center gap-2 border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        TONE_CLASSES[tone]
      } ${fullWidth ? 'w-full lg:w-auto lg:min-w-[7.5rem]' : ''} ${className}`}
    >
      <ButtonLoadingContent loading={loading} loadingText={loadingText}>
        {children}
      </ButtonLoadingContent>
    </button>
  );
}
