'use client';

import SkeletonBlock from '@/components/atoms/SkeletonBlock';

interface DatabaseConnectionCardSkeletonProps {
  testId?: string;
}

export default function DatabaseConnectionCardSkeleton({
  testId,
}: DatabaseConnectionCardSkeletonProps) {
  return (
    <div
      data-testid={testId ?? 'database-connection-card-skeleton'}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading database connection"
      className="space-y-4"
    >
      <div
        className="border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0a0a0a]"
      >
        <div className="flex items-center gap-3">
          <SkeletonBlock width="1.5rem" height="1.5rem" rounded />
          <div className="flex-1 space-y-2">
            <SkeletonBlock width="40%" height="0.75rem" />
            <SkeletonBlock width="80%" height="0.625rem" />
          </div>
          <SkeletonBlock width="4.5rem" height="1.75rem" />
        </div>
      </div>
      <div className="border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <SkeletonBlock width="1rem" height="1rem" rounded />
          <SkeletonBlock width="55%" height="0.625rem" />
        </div>
      </div>
    </div>
  );
}
