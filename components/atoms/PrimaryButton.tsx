'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  fullWidth = true,
  className = '',
  type = 'button',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className={`inline-flex items-center justify-center gap-2 bg-black px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 ${
        fullWidth ? 'w-full lg:w-auto lg:min-w-[7.5rem]' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
}
