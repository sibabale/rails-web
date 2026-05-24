import { describe, expect, it, vi } from 'vitest';
import {
  buildConnectionsResponseFromStatuses,
  buildPostConnectRefreshState,
  computeInteractionsLocked,
  computeIsCardStateReady,
  connectionSetupNotice,
  connectionUiStatusFromApi,
  isPostgresConnectionString,
  isUnchangedSaveResponse,
  listSavedConnectionServices,
  listServicesNeedingRepair,
  savedConnectionKeysFromSummary,
  statusesFromListResponse,
  mergeMigrationStatusForService,
  migrationInfoFromSetup,
  shouldRunFullHealthRefreshAfterSave,
  setupPhaseIndex,
  unchangedConnectionNotice,
  UNCHANGED_CONNECTION_NOTICE,
  waitForSetupPhaseVisible,
  shouldSuppressStandaloneServiceNotice,
  resolveMigrationAlertIcon,
  isSetupComplete,
  isFullyConnected,
  setupOutcomeFromSave,
  areAllServicesSetupComplete,
  mergeConnectionStatusForService,
  mergeMigrationRunForService,
  resolveRetryStartPhase,
} from './databaseConnectionSetup';
describe('databaseConnectionSetup', () => {
  it('accepts postgres and postgresql URLs', () => {
    expect(isPostgresConnectionString('postgres://user:pass@host/db')).toBe(true);
    expect(isPostgresConnectionString('postgresql://user:pass@host/db')).toBe(true);
  });

  it('rejects non-postgres URLs', () => {
    expect(isPostgresConnectionString('mysql://user:pass@host/db')).toBe(false);
    expect(isPostgresConnectionString('')).toBe(false);
  });

  it('maps API statuses to UI statuses', () => {
    expect(connectionUiStatusFromApi({ status: 'connected' })).toBe('connected');
    expect(connectionUiStatusFromApi({ status: 'invalid' })).toBe('invalid');
    expect(connectionUiStatusFromApi()).toBe('missing');
  });

  it('orders setup phases', () => {
    expect(setupPhaseIndex('validating')).toBe(0);
    expect(setupPhaseIndex('connecting')).toBe(1);
    expect(setupPhaseIndex('setting_up')).toBe(2);
  });

  it('waits for setup phase visibility', async () => {
    vi.useFakeTimers();
    const promise = waitForSetupPhaseVisible('validating');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('renders cards after list snapshot without waiting for health overlay', () => {
    expect(computeIsCardStateReady(false, true)).toBe(true);
    expect(computeIsCardStateReady(false, false)).toBe(false);
    expect(computeIsCardStateReady(true, false)).toBe(true);
  });

  it('requires migration refresh only after connected save (not validate)', () => {
    expect(shouldRunFullHealthRefreshAfterSave({ status: 'connected' })).toBe(true);
    expect(shouldRunFullHealthRefreshAfterSave({ status: 'invalid' })).toBe(false);
    expect(shouldRunFullHealthRefreshAfterSave({ status: 'connected', unchanged: true })).toBe(
      false
    );
  });

  it('post-connect refresh keeps POST connected status without validate clobber', () => {
    const { summary, migrations } = buildPostConnectRefreshState(
      {
        service: 'accounts',
        status: 'connected',
        setup: {
          migration_status: 'applied',
          pending_count: 0,
          applied_count: 1,
        },
      },
      {
        accounts: 'connected',
        users: 'missing',
        ledger: 'missing',
        audit: 'missing',
      },
      null
    );

    expect(summary.connections.find((c) => c.service === 'accounts')?.status).toBe('connected');
    expect(migrations.services.find((s) => s.service === 'accounts')?.latest_status).toBe('applied');
  });

  it('detects unchanged save responses', () => {
    expect(isUnchangedSaveResponse({ unchanged: true })).toBe(true);
    expect(isUnchangedSaveResponse({ unchanged: false })).toBe(false);
    expect(isUnchangedSaveResponse({})).toBe(false);
  });

  it('returns unchanged connection notice text', () => {
    expect(unchangedConnectionNotice()).toBe(UNCHANGED_CONNECTION_NOTICE);
    expect(UNCHANGED_CONNECTION_NOTICE).toContain('same connection string');
  });

  it('locks interactions while migrations are running', () => {
    expect(computeInteractionsLocked(true)).toBe(true);
    expect(computeInteractionsLocked(false)).toBe(false);
  });

  it('builds migration info from save setup payload', () => {
    const info = migrationInfoFromSetup({
      service: 'accounts',
      status: 'connected',
      setup: {
        migration_status: 'failed',
        pending_count: 2,
        applied_count: 0,
        error: 'permission denied',
      },
    });

    expect(info?.failed_count).toBe(1);
    expect(info?.latest_status).toBe('failed');
  });

  it('clears pending count when inline setup reports applied', () => {
    const info = migrationInfoFromSetup({
      service: 'users',
      status: 'connected',
      setup: {
        migration_status: 'applied',
        pending_count: 2,
        applied_count: 1,
      },
    });

    expect(info?.pending_count).toBe(0);
    expect(info?.failed_count).toBe(0);
    expect(info?.latest_status).toBe('applied');
  });

  it('post-connect refresh merges into local snapshot without GET migrations', () => {
    const priorSnapshot = {
      has_pending_updates: false,
      requires_manual_update: false,
      services: [
        {
          service: 'accounts' as const,
          connection_status: 'connected',
          pending_count: 0,
          failed_count: 0,
          latest_status: 'applied',
        },
        {
          service: 'users' as const,
          connection_status: 'connected',
          pending_count: 0,
          failed_count: 0,
          latest_status: 'applied',
        },
      ],
    };

    const { migrations } = buildPostConnectRefreshState(
      {
        service: 'ledger',
        status: 'connected',
        setup: {
          migration_status: 'applied',
          pending_count: 0,
          applied_count: 1,
        },
      },
      {
        accounts: 'connected',
        users: 'connected',
        ledger: 'connected',
        audit: 'missing',
      },
      priorSnapshot
    );

    expect(migrations.has_pending_updates).toBe(false);
    expect(migrations.services.find((s) => s.service === 'ledger')?.latest_status).toBe('applied');
  });

  it('merges migration status for a single service', () => {
    const merged = mergeMigrationStatusForService(null, {
      service: 'users',
      connection_status: 'connected',
      pending_count: 1,
      failed_count: 0,
      latest_status: 'pending',
    });

    expect(merged.services).toHaveLength(1);
    expect(merged.has_pending_updates).toBe(true);
  });

  it('returns setup notice for connected migration failures', () => {
    const notice = connectionSetupNotice({
      service: 'ledger',
      status: 'connected',
      setup: {
        migration_status: 'failed',
        pending_count: 1,
        applied_count: 0,
        message: 'Schema setup could not finish.',
      },
    });

    expect(notice).toBe('Schema setup could not finish.');
  });

  it('lists saved connection services from summary', () => {
    const services = listSavedConnectionServices({
      all_connected: false,
      connections: [
        { service: 'accounts', status: 'connected' },
        { service: 'users', status: 'missing' },
        { service: 'ledger', status: 'invalid' },
        { service: 'audit', status: 'missing' },
      ],
    });

    expect(services).toEqual(['accounts', 'ledger']);
  });

  it('maps list response to UI statuses', () => {
    const statuses = statusesFromListResponse({
      all_connected: false,
      connections: [
        { service: 'accounts', status: 'connected' },
        { service: 'users', status: 'missing' },
        { service: 'ledger', status: 'invalid' },
        { service: 'audit', status: 'missing' },
      ],
    });

    expect(statuses).toEqual({
      accounts: 'connected',
      users: 'missing',
      ledger: 'invalid',
      audit: 'missing',
    });
  });

  it('builds all_connected from local statuses', () => {
    const response = buildConnectionsResponseFromStatuses({
      accounts: 'connected',
      users: 'connected',
      ledger: 'connected',
      audit: 'connected',
    });

    expect(response.all_connected).toBe(true);
  });

  describe('shouldSuppressStandaloneServiceNotice', () => {
    const failureCopy =
      'Your database connection is active, but required schema setup could not finish. Use Apply updates or replace the connection string to retry.';

    it('suppresses duplicate when migration footer is danger with same copy', () => {
      expect(
        shouldSuppressStandaloneServiceNotice(failureCopy, failureCopy, 'danger')
      ).toBe(true);
    });

    it('suppresses duplicate when migration footer is warning with overlapping copy', () => {
      expect(
        shouldSuppressStandaloneServiceNotice(
          UNCHANGED_CONNECTION_NOTICE,
          UNCHANGED_CONNECTION_NOTICE,
          'warning'
        )
      ).toBe(true);
    });

    it('does not suppress when footer is neutral and messages differ', () => {
      expect(
        shouldSuppressStandaloneServiceNotice(
          UNCHANGED_CONNECTION_NOTICE,
          'Schema migrations are applied for this database.',
          'neutral'
        )
      ).toBe(false);
    });

    it('suppresses when notice is substring of migration copy', () => {
      expect(
        shouldSuppressStandaloneServiceNotice(
          'schema setup could not finish',
          failureCopy,
          'danger'
        )
      ).toBe(true);
    });
  });

  describe('resolveMigrationAlertIcon', () => {
    it('uses error icon for danger tone', () => {
      expect(resolveMigrationAlertIcon('danger')).toBe('error');
    });

    it('uses warning icon for warning tone', () => {
      expect(resolveMigrationAlertIcon('warning')).toBe('warning');
    });

    it('uses check_circle for success tone', () => {
      expect(resolveMigrationAlertIcon('success')).toBe('check_circle');
    });
  });

  describe('isSetupComplete', () => {
    it('returns true for applied or skipped migration_status', () => {
      expect(isSetupComplete({ migration_status: 'applied', pending_count: 0, applied_count: 1 })).toBe(true);
      expect(isSetupComplete({ migration_status: 'skipped', pending_count: 0, applied_count: 0 })).toBe(true);
    });

    it('returns false for failed or pending migration_status', () => {
      expect(isSetupComplete({ migration_status: 'failed', pending_count: 1, applied_count: 0 })).toBe(false);
      expect(isSetupComplete(null)).toBe(false);
    });

    it('returns true for migration info with applied latest_status', () => {
      expect(
        isSetupComplete({
          service: 'accounts',
          connection_status: 'connected',
          pending_count: 0,
          failed_count: 0,
          latest_status: 'applied',
        })
      ).toBe(true);
    });
  });

  describe('isFullyConnected', () => {
    it('requires connected status and setup complete', () => {
      expect(
        isFullyConnected('connected', { migration_status: 'applied', pending_count: 0, applied_count: 1 })
      ).toBe(true);
      expect(
        isFullyConnected('connected', { migration_status: 'failed', pending_count: 1, applied_count: 0 })
      ).toBe(false);
      expect(
        isFullyConnected('invalid', { migration_status: 'applied', pending_count: 0, applied_count: 1 })
      ).toBe(false);
    });
  });

  describe('setupOutcomeFromSave', () => {
    it('maps migration failure to setting_up failed phase', () => {
      expect(
        setupOutcomeFromSave({
          status: 'connected',
          setup: { migration_status: 'failed', pending_count: 1, applied_count: 0 },
        })
      ).toEqual({ outcome: 'failed', failedPhase: 'setting_up' });
    });

    it('maps invalid pool to connecting failed phase', () => {
      expect(setupOutcomeFromSave({ status: 'invalid', setup: undefined })).toEqual({
        outcome: 'failed',
        failedPhase: 'connecting',
      });
    });

    it('maps applied setup to succeeded', () => {
      expect(
        setupOutcomeFromSave({
          status: 'connected',
          setup: { migration_status: 'applied', pending_count: 0, applied_count: 1 },
        })
      ).toEqual({ outcome: 'succeeded' });
    });
  });

  describe('listServicesNeedingRepair', () => {
    it('includes invalid saved connections only', () => {
      const summary = buildConnectionsResponseFromStatuses({
        accounts: 'connected',
        users: 'invalid',
        ledger: 'missing',
        audit: 'missing',
      });
      expect(listServicesNeedingRepair(summary)).toEqual(['users']);
    });

    it('includes setup-failed connected services when migrations report failed', () => {
      const summary = buildConnectionsResponseFromStatuses({
        accounts: 'connected',
        users: 'connected',
        ledger: 'missing',
        audit: 'missing',
      });
      expect(
        listServicesNeedingRepair(summary, {
          has_pending_updates: true,
          requires_manual_update: true,
          services: [
            {
              service: 'accounts',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 0,
              latest_status: 'applied',
            },
            {
              service: 'users',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 1,
              latest_status: 'failed',
            },
          ],
        })
      ).toEqual(['users']);
    });

    it('derives saved keys from summary', () => {
      const summary = buildConnectionsResponseFromStatuses({
        accounts: 'connected',
        users: 'invalid',
        ledger: 'missing',
        audit: 'missing',
      });
      expect([...savedConnectionKeysFromSummary(summary)]).toEqual(['accounts', 'users']);
    });
  });

  describe('resolveRetryStartPhase', () => {
    it('starts invalid cards at validating', () => {
      expect(resolveRetryStartPhase('invalid')).toBe('validating');
    });

    it('starts setup-failed cards at setting_up', () => {
      expect(resolveRetryStartPhase('setup_failed')).toBe('setting_up');
    });

    it('starts pending migration cards at setting_up', () => {
      expect(resolveRetryStartPhase('pending_migrations')).toBe('setting_up');
    });
  });

  describe('mergeConnectionStatusForService', () => {
    it('updates only the target service status', () => {
      const merged = mergeConnectionStatusForService(
        { accounts: 'invalid', users: 'connected', ledger: 'missing', audit: 'missing' },
        'accounts',
        { status: 'connected' }
      );
      expect(merged.accounts).toBe('connected');
      expect(merged.users).toBe('connected');
    });
  });

  describe('mergeMigrationRunForService', () => {
    it('merges a single migration run result into the snapshot', () => {
      const merged = mergeMigrationRunForService(null, {
        service: 'accounts',
        status: 'applied',
        pending_count: 0,
        applied_count: 1,
      });
      expect(merged.services.find((s) => s.service === 'accounts')?.latest_status).toBe('applied');
    });

    it('marks failed migration runs with failed_count', () => {
      const merged = mergeMigrationRunForService(null, {
        service: 'users',
        status: 'failed',
        pending_count: 1,
        applied_count: 0,
        error: 'permission denied',
      });
      expect(merged.services.find((s) => s.service === 'users')?.failed_count).toBe(1);
      expect(merged.services.find((s) => s.service === 'users')?.latest_status).toBe('failed');
    });
  });

  describe('areAllServicesSetupComplete', () => {
    it('returns true when every service is connected with applied migrations', () => {
      expect(
        areAllServicesSetupComplete({
          has_pending_updates: false,
          requires_manual_update: false,
          services: [
            {
              service: 'accounts',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 0,
              latest_status: 'applied',
            },
            {
              service: 'users',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 0,
              latest_status: 'applied',
            },
            {
              service: 'ledger',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 0,
              latest_status: 'applied',
            },
            {
              service: 'audit',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 0,
              latest_status: 'applied',
            },
          ],
        })
      ).toBe(true);
    });

    it('returns false when any service has failed migrations', () => {
      expect(
        areAllServicesSetupComplete({
          has_pending_updates: true,
          requires_manual_update: true,
          services: [
            {
              service: 'accounts',
              connection_status: 'connected',
              pending_count: 0,
              failed_count: 1,
              latest_status: 'failed',
            },
          ],
        })
      ).toBe(false);
    });
  });
});
