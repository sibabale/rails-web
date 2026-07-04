'use client';

import type { ReactNode } from 'react';
import Banner from '@/components/molecules/Banner/Banner';

interface DatabaseUpdatesBannerProps {
  pendingMigrationCount: number;
  action?: ReactNode;
  role?: 'alert' | 'status';
  testId?: string;
}

export default function DatabaseUpdatesBanner({
  pendingMigrationCount,
  action,
  role = 'alert',
  testId,
}: DatabaseUpdatesBannerProps) {
  if (pendingMigrationCount <= 0) {
    return null;
  }

  return (
    <Banner
      tone="warning"
      icon="database"
      title="Database updates available"
      action={action}
      role={role}
      testId={testId}
    >
      {pendingMigrationCount === 1
        ? '1 database update is ready to apply.'
        : `${pendingMigrationCount} database updates are ready to apply.`}
    </Banner>
  );
}
