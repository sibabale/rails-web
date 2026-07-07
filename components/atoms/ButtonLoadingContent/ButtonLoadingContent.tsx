'use client';

import type { ReactNode } from 'react';
import Spinner from '@/components/atoms/Spinner/Spinner';

interface ButtonLoadingContentProps {
  loading: boolean;
  children: ReactNode;
  loadingText?: ReactNode;
  spinnerSize?: number;
}

export default function ButtonLoadingContent({
  loading,
  children,
  loadingText,
  spinnerSize = 14,
}: ButtonLoadingContentProps) {
  if (!loading) return children;

  if (loadingText) {
    return (
      <>
        <Spinner size={spinnerSize} />
        {loadingText}
      </>
    );
  }

  return (
    <>
      <span className="invisible" aria-hidden>
        {children}
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner size={spinnerSize} />
      </span>
    </>
  );
}
