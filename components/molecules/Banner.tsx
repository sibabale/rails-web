'use client';

import type { ReactNode } from 'react';
import MaterialIcon from '@/components/atoms/MaterialIcon';

export type BannerTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BannerProps {
  tone?: BannerTone;
  icon?: string;
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  role?: 'alert' | 'status';
  testId?: string;
  size?: 'sm' | 'md';
}

const TONE: Record<BannerTone, { wrapper: string; icon: string; title: string; body: string }> = {
  neutral: {
    wrapper: 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950',
    icon: 'text-zinc-500 dark:text-zinc-400',
    title: 'text-zinc-900 dark:text-zinc-100',
    body: 'text-zinc-600 dark:text-zinc-400',
  },
  info: {
    wrapper: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-300',
    body: 'text-emerald-700 dark:text-emerald-400/90',
  },
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-200',
    body: 'text-emerald-700 dark:text-emerald-400/90',
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20',
    icon: 'text-amber-700 dark:text-amber-300',
    title: 'text-amber-950 dark:text-amber-100',
    body: 'text-amber-900 dark:text-amber-200',
  },
  danger: {
    wrapper: 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-700 dark:text-red-300',
    body: 'text-red-700 dark:text-red-200',
  },
};

export default function Banner({
  tone = 'neutral',
  icon,
  title,
  children,
  action,
  role,
  testId,
  size = 'md',
}: BannerProps) {
  const t = TONE[tone];
  const padding = size === 'sm' ? 'p-3' : 'p-4';
  const bodySize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      role={role}
      data-testid={testId}
      className={`flex flex-col gap-3 border ${padding} sm:flex-row sm:items-start sm:justify-between ${t.wrapper}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon ? (
          <MaterialIcon
            name={icon}
            size={size === 'sm' ? 16 : 18}
            className={`mt-0.5 shrink-0 ${t.icon}`}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {title ? (
            <p className={`text-xs font-mono font-bold uppercase tracking-widest ${t.title}`}>
              {title}
            </p>
          ) : null}
          <div className={`${title ? 'mt-1' : ''} ${bodySize} leading-relaxed ${t.body}`}>
            {children}
          </div>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
