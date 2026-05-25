'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ButtonLoadingContent from '@/components/atoms/ButtonLoadingContent/ButtonLoadingContent';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
}

export default function PrimaryButton({
  children,
  fullWidth = true,
  className = '',
  type = 'button',
  loading = false,
  loadingText,
  disabled,
  'aria-busy': ariaBusy,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading ? true : ariaBusy}
      className={`relative inline-flex items-center justify-center gap-2 bg-black px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 ${
        fullWidth ? 'w-full lg:w-auto lg:min-w-[7.5rem]' : ''
      } ${className}`}
    >
      <ButtonLoadingContent loading={loading} loadingText={loadingText}>
        {children}
      </ButtonLoadingContent>
    </button>
  );
}
