import type { DatabaseConnectionMigrationStatusResponse } from '@/lib/api';

export function pendingMigrationCountFor(
  status: DatabaseConnectionMigrationStatusResponse | null | undefined
): number {
  if (!status?.services.length) {
    return 0;
  }
  return status.services.reduce(
    (total, service) => total + service.pending_count + service.failed_count,
    0
  );
}

export function hasUpdatesAvailableFor(
  status: DatabaseConnectionMigrationStatusResponse | null | undefined
): boolean {
  return pendingMigrationCountFor(status) > 0;
}
