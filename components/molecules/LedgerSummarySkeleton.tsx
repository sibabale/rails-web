'use client';

import SkeletonBlock from '@/components/atoms/SkeletonBlock';

interface LedgerSummarySkeletonProps {
  testId?: string;
}

export default function LedgerSummarySkeleton({
  testId = 'ledger-summary-skeleton',
}: LedgerSummarySkeletonProps) {
  return (
    <div
      data-testid={testId}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading ledger summary"
      className="space-y-4"
    >
      <span className="sr-only">Loading ledger summary</span>
      <div className="border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
        <div className="mb-4 flex items-center justify-between gap-3">
          <SkeletonBlock width="5.5rem" height="0.625rem" />
          <SkeletonBlock width="2.5rem" height="1.25rem" />
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <SkeletonBlock width="3rem" height="0.625rem" />
          <SkeletonBlock width="1.5rem" height="0.875rem" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <SkeletonBlock width="3.25rem" height="0.625rem" />
          <SkeletonBlock width="1.5rem" height="0.875rem" />
        </div>
      </div>
    </div>
  );
}
