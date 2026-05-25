import type { ReactNode } from 'react';
import MaterialIcon from '@/components/atoms/MaterialIcon';

export type OnboardingStepState = 'locked' | 'active' | 'complete';

export interface OnboardingStepCardProps {
  stepNumber: number;
  state: OnboardingStepState;
  title: string;
  description: string;
  cta: ReactNode;
  testId?: string;
}

const CARD_CLASSES: Record<OnboardingStepState, string> = {
  complete:
    'border-emerald-200 bg-emerald-50/60 opacity-90 dark:border-emerald-900/50 dark:bg-emerald-950/20',
  active:
    'border-zinc-200 bg-zinc-50 shadow-sm ring-1 ring-black dark:border-zinc-800 dark:bg-[#0a0a0a] dark:ring-white',
  locked: 'border-zinc-200 bg-white opacity-60 dark:border-zinc-800 dark:bg-[#050505]',
};

const BADGE_CLASSES: Record<OnboardingStepState, string> = {
  complete: 'bg-emerald-500 text-white',
  active: 'bg-black text-white dark:bg-white dark:text-black',
  locked: 'border border-zinc-300 text-zinc-500 dark:border-zinc-700',
};

export default function OnboardingStepCard({
  stepNumber,
  state,
  title,
  description,
  cta,
  testId,
}: OnboardingStepCardProps) {
  return (
    <div
      data-testid={testId}
      className={`flex h-full flex-col border p-6 transition-colors ${CARD_CLASSES[state]}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${BADGE_CLASSES[state]}`}
        >
          {state === 'complete' ? (
            <MaterialIcon name="check" className="!text-[14px]" />
          ) : (
            stepNumber
          )}
        </div>
        {state === 'active' && (
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-black dark:bg-zinc-800 dark:text-white">
            Action required
          </span>
        )}
      </div>
      <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">{title}</h3>
      <p className="mb-6 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {cta}
    </div>
  );
}
