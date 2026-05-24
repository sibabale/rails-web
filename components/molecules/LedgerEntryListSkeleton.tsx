'use client';

import SkeletonBlock from '@/components/atoms/SkeletonBlock';

interface LedgerEntryListSkeletonProps {
  rows?: number;
  testId?: string;
}

export default function LedgerEntryListSkeleton({
  rows = 6,
  testId = 'ledger-entry-list-skeleton',
}: LedgerEntryListSkeletonProps) {
  return (
    <div
      data-testid={testId}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading ledger entries"
      className="space-y-3"
    >
      <span className="sr-only">Loading ledger entries</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#050505]"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <SkeletonBlock width="38%" height="0.75rem" />
            <SkeletonBlock width="3.5rem" height="1.125rem" rounded />
          </div>
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock width="30%" height="0.625rem" />
            <SkeletonBlock width="28%" height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
