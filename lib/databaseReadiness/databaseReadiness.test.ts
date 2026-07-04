import { describe, expect, it } from 'vitest';
import { hasAllMigrationTargets, isMigrationStatusCurrent } from './index';
import type { DatabaseConnectionMigrationStatusResponse } from '../api';

const migrationStatus = (
  overrides: Partial<DatabaseConnectionMigrationStatusResponse> = {},
): DatabaseConnectionMigrationStatusResponse => ({
  has_pending_updates: false,
  requires_manual_update: false,
  services: [
    {
      service: 'accounts',
      connection_status: 'connected',
      pending_count: 0,
      failed_count: 0,
      latest_status: 'applied',
      latest_version: '1',
      latest_updated_at: null,
    },
    {
      service: 'users',
      connection_status: 'connected',
      pending_count: 0,
      failed_count: 0,
      latest_status: 'applied',
      latest_version: '1',
      latest_updated_at: null,
    },
    {
      service: 'ledger',
      connection_status: 'connected',
      pending_count: 0,
      failed_count: 0,
      latest_status: 'applied',
      latest_version: '1',
      latest_updated_at: null,
    },
    {
      service: 'audit',
      connection_status: 'connected',
      pending_count: 0,
      failed_count: 0,
      latest_status: 'applied',
      latest_version: '1',
      latest_updated_at: null,
    },
  ],
  ...overrides,
});

describe('databaseReadiness', () => {
  it('isMigrationStatusCurrent is true only when every connected service is applied', () => {
    expect(isMigrationStatusCurrent(migrationStatus())).toBe(true);
    expect(
      isMigrationStatusCurrent(
        migrationStatus({
          services: migrationStatus().services.map((service, index) =>
            index === 0 ? { ...service, latest_status: 'pending', pending_count: 1 } : service,
          ),
        }),
      ),
    ).toBe(false);
  });

  it('hasAllMigrationTargets requires every service row to be connected', () => {
    expect(hasAllMigrationTargets(migrationStatus())).toBe(true);
    expect(
      hasAllMigrationTargets(
        migrationStatus({
          services: migrationStatus().services.map((service, index) =>
            index === 2 ? { ...service, connection_status: 'missing', latest_status: 'not_connected' } : service,
          ),
        }),
      ),
    ).toBe(false);
  });
});
