'use client';

import type { ReactNode } from 'react';

export default function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 self-start rounded-full border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 lg:self-center">
      {children}
    </span>
  );
}
