import type { DatabaseConnectionMigrationStatusResponse } from '../api';

export const isMigrationStatusCurrent = (status: DatabaseConnectionMigrationStatusResponse | null | undefined) =>
  Boolean(
    status?.services.length &&
      status.services.every(
        (service) =>
          service.connection_status === 'connected' &&
          service.pending_count === 0 &&
          service.failed_count === 0 &&
          service.latest_status === 'applied'
      )
  );

export const hasAllMigrationTargets = (status: DatabaseConnectionMigrationStatusResponse | null | undefined) =>
  Boolean(status?.services.length && status.services.every((service) => service.connection_status === 'connected'));
