import { describe, expect, it } from 'vitest';
import { hasUpdatesAvailableFor, pendingMigrationCountFor } from './index';
import type { DatabaseConnectionMigrationStatusResponse } from '@/lib/api';

const status = (
  overrides: Partial<DatabaseConnectionMigrationStatusResponse> = {}
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
  ],
  ...overrides,
});

describe('migrationUpdates', () => {
  it('returns 0 and false for empty status', () => {
    expect(pendingMigrationCountFor(null)).toBe(0);
    expect(hasUpdatesAvailableFor(undefined)).toBe(false);
  });

  it('sums pending and failed counts', () => {
    expect(
      pendingMigrationCountFor(
        status({
          services: [
            { ...status().services[0], pending_count: 2, failed_count: 0 },
            { ...status().services[1], pending_count: 0, failed_count: 1 },
          ],
        })
      )
    ).toBe(3);
  });

  it('flags updates as available when count is greater than zero', () => {
    expect(
      hasUpdatesAvailableFor(
        status({
          services: [{ ...status().services[0], pending_count: 1, failed_count: 0 }],
        })
      )
    ).toBe(true);
    expect(hasUpdatesAvailableFor(status())).toBe(false);
  });
});
