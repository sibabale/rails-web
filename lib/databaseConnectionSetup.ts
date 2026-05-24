import type {
  DatabaseConnectionInfo,
  DatabaseConnectionMigrationInfo,
  DatabaseConnectionMigrationRunInfo,
  DatabaseConnectionMigrationStatusResponse,
  DatabaseConnectionService,
  DatabaseConnectionsResponse,
} from '@/lib/api';

export type DatabaseSetupPhase = 'validating' | 'connecting' | 'setting_up';

export type SetupProgressOutcome = 'in_progress' | 'failed' | 'succeeded';

export interface SetupOutcomeState {
  outcome: SetupProgressOutcome;
  failedPhase?: DatabaseSetupPhase;
}

export const DATABASE_CONNECTION_SERVICES: DatabaseConnectionService[] = [
  'accounts',
  'users',
  'ledger',
  'audit',
];

export const DATABASE_SETUP_STEPS: {
  id: DatabaseSetupPhase;
  label: string;
  description: string;
}[] = [
  {
    id: 'validating',
    label: 'Validating',
    description: 'Checking the PostgreSQL connection string and credentials.',
  },
  {
    id: 'connecting',
    label: 'Connecting',
    description: 'Opening a secure connection pool to your database provider.',
  },
  {
    id: 'setting_up',
    label: 'Setting up',
    description: 'Applying required schema migrations for this service.',
  },
];

/** Card render gate: list snapshot only — background health must not block Connected UI. */
export function computeIsCardStateReady(
  isSettingUp: boolean,
  initialCheckComplete: boolean
): boolean {
  return isSettingUp || initialCheckComplete;
}

export function listSavedConnectionServices(
  summary: DatabaseConnectionsResponse
): DatabaseConnectionService[] {
  return summary.connections
    .filter((connection) => connection.status === 'connected' || connection.status === 'invalid')
    .map((connection) => connection.service);
}

export function statusesFromListResponse(
  summary: DatabaseConnectionsResponse
): Record<DatabaseConnectionService, ConnectionUiStatus> {
  return DATABASE_CONNECTION_SERVICES.reduce(
    (statuses, service) => {
      const connection = summary.connections.find((entry) => entry.service === service);
      statuses[service] = connectionUiStatusFromApi(connection);
      return statuses;
    },
    {} as Record<DatabaseConnectionService, ConnectionUiStatus>
  );
}

/** Saved connections that need repair — excludes never-connected (missing) services. */
export function listServicesNeedingRepair(
  summary: DatabaseConnectionsResponse,
  migrations?: DatabaseConnectionMigrationStatusResponse | null
): DatabaseConnectionService[] {
  return summary.connections
    .filter((connection) => {
      if (connection.status === 'invalid') {
        return true;
      }
      if (connection.status !== 'connected' || !migrations) {
        return false;
      }
      const migrationInfo = migrations.services.find((entry) => entry.service === connection.service);
      return (
        (migrationInfo?.failed_count ?? 0) > 0 || migrationInfo?.latest_status === 'failed'
      );
    })
    .map((connection) => connection.service);
}

export function savedConnectionKeysFromSummary(
  summary: DatabaseConnectionsResponse
): Set<DatabaseConnectionService> {
  return new Set(listSavedConnectionServices(summary));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function setupPhaseIndex(phase: DatabaseSetupPhase): number {
  return DATABASE_SETUP_STEPS.findIndex((step) => step.id === phase);
}

const SETUP_PHASE_MIN_VISIBLE_MS: Record<DatabaseSetupPhase, number> = {
  validating: 450,
  connecting: 0,
  setting_up: 400,
};

function waitForPaint(): Promise<void> {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

/** Ensures a setup step paints with a spinner before later phases mark it complete. */
export async function waitForSetupPhaseVisible(phase: DatabaseSetupPhase): Promise<void> {
  await waitForPaint();
  const minMs = SETUP_PHASE_MIN_VISIBLE_MS[phase];
  if (minMs <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, minMs);
  });
}

export const UNCHANGED_CONNECTION_NOTICE =
  'This is the same connection string already saved.';

export function isUnchangedSaveResponse(
  saved: Pick<DatabaseConnectionInfo, 'unchanged'>
): boolean {
  return saved.unchanged === true;
}

export function unchangedConnectionNotice(): string {
  return UNCHANGED_CONNECTION_NOTICE;
}

export function computeInteractionsLocked(isRunningMigrations: boolean): boolean {
  return isRunningMigrations;
}

/**
 * After POST connect, refresh migration snapshot when the save succeeded.
 * Does NOT imply POST /validate — validate re-pings every stored pool and can
 * mark siblings invalid while the user is still connecting services (RAI-21/22).
 * Unchanged saves skip refresh entirely.
 */
export function shouldRunFullHealthRefreshAfterSave(
  saved: Pick<DatabaseConnectionInfo, 'status' | 'unchanged'>
): boolean {
  if (isUnchangedSaveResponse(saved)) {
    return false;
  }
  return saved.status === 'connected';
}

/** Post-connect refresh: trust POST status, merge migrations for this service only. */
export function buildPostConnectRefreshState(
  saved: DatabaseConnectionInfo,
  currentStatuses: Record<DatabaseConnectionService, ConnectionUiStatus>,
  migrationsResponse: DatabaseConnectionMigrationStatusResponse | null
): {
  summary: DatabaseConnectionsResponse;
  migrations: DatabaseConnectionMigrationStatusResponse;
} {
  const serviceMigration = migrationInfoFromSetup(saved);
  const migrations = serviceMigration
    ? mergeMigrationStatusForService(migrationsResponse, serviceMigration)
    : migrationsResponse ?? {
        has_pending_updates: false,
        requires_manual_update: false,
        services: [],
      };

  return {
    summary: buildConnectionsResponseFromStatuses(currentStatuses),
    migrations,
  };
}

export function isPostgresConnectionString(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://');
}

export type ConnectionUiStatus = 'idle' | 'connecting' | 'connected' | 'invalid' | 'missing';

export function connectionUiStatusFromApi(
  connection: { status: string } | undefined
): ConnectionUiStatus {
  if (!connection) return 'missing';
  if (connection.status === 'connected') return 'connected';
  if (connection.status === 'invalid') return 'invalid';
  return 'missing';
}

export function migrationInfoFromSetup(
  saved: DatabaseConnectionInfo
): DatabaseConnectionMigrationInfo | null {
  const setup = saved.setup;
  if (!setup) return null;

  if (saved.status !== 'connected') {
    return {
      service: saved.service,
      connection_status: saved.status,
      pending_count: 0,
      failed_count: 0,
      latest_version: null,
      latest_status: 'not_connected',
      latest_updated_at: null,
    };
  }

  const migrationFailed = setup.migration_status === 'failed';
  const migrationApplied = setup.migration_status === 'applied' || setup.migration_status === 'skipped';

  return {
    service: saved.service,
    connection_status: 'connected',
    pending_count: migrationFailed || migrationApplied ? 0 : setup.pending_count,
    failed_count: migrationFailed ? 1 : 0,
    latest_version: null,
    latest_status: migrationFailed ? 'failed' : migrationApplied ? 'applied' : 'pending',
    latest_updated_at: null,
  };
}

export function mergeMigrationStatusForService(
  current: DatabaseConnectionMigrationStatusResponse | null,
  serviceInfo: DatabaseConnectionMigrationInfo
): DatabaseConnectionMigrationStatusResponse {
  const existing = current?.services.filter((service) => service.service !== serviceInfo.service) ?? [];
  const services = [...existing, serviceInfo].sort(
    (left, right) =>
      DATABASE_CONNECTION_SERVICES.indexOf(left.service) -
      DATABASE_CONNECTION_SERVICES.indexOf(right.service)
  );
  const hasPendingUpdates = services.some(
    (service) => service.pending_count > 0 || service.failed_count > 0
  );

  return {
    has_pending_updates: hasPendingUpdates,
    requires_manual_update: hasPendingUpdates,
    services,
  };
}

export function buildConnectionsResponseFromStatuses(
  statuses: Record<DatabaseConnectionService, ConnectionUiStatus>
): DatabaseConnectionsResponse {
  const connections = DATABASE_CONNECTION_SERVICES.map((service) => {
    const uiStatus = statuses[service];
    const status =
      uiStatus === 'connected' || uiStatus === 'invalid'
        ? uiStatus
        : ('missing' as const);
    return {
      service,
      status,
      last_validated_at: null,
      updated_at: null,
    };
  });

  return {
    all_connected: connections.every((connection) => connection.status === 'connected'),
    connections,
  };
}

export type MigrationAlertTone = 'neutral' | 'warning' | 'danger' | 'success';

export function normalizeAlertText(value: string): string {
  return value.trim().toLowerCase();
}

export function messagesOverlap(left: string, right: string): boolean {
  const normalizedLeft = normalizeAlertText(left);
  const normalizedRight = normalizeAlertText(right);
  if (!normalizedLeft || !normalizedRight) {
    return false;
  }
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

/** Footer owns danger/warning alerts; suppress standalone notice when copy overlaps. */
export function shouldSuppressStandaloneServiceNotice(
  serviceNotice: string | null,
  migrationCopy: string,
  migrationTone: MigrationAlertTone
): boolean {
  if (!serviceNotice) {
    return true;
  }
  if (migrationTone === 'danger' || migrationTone === 'warning') {
    return true;
  }
  return messagesOverlap(serviceNotice, migrationCopy);
}

export function resolveMigrationAlertIcon(tone: MigrationAlertTone): string {
  if (tone === 'success') {
    return 'check_circle';
  }
  if (tone === 'danger') {
    return 'error';
  }
  if (tone === 'warning') {
    return 'warning';
  }
  return 'schedule';
}

export function isSetupComplete(
  setup: DatabaseConnectionInfo['setup'] | DatabaseConnectionMigrationInfo | null | undefined
): boolean {
  if (!setup) return false;
  if ('migration_status' in setup) {
    return setup.migration_status === 'applied' || setup.migration_status === 'skipped';
  }
  return (
    setup.failed_count === 0 &&
    (setup.latest_status === 'applied' || setup.latest_status === 'skipped')
  );
}

export function isFullyConnected(
  status: string,
  setup: DatabaseConnectionInfo['setup'] | DatabaseConnectionMigrationInfo | null | undefined
): boolean {
  if (status !== 'connected') return false;
  return isSetupComplete(setup);
}

/**
 * Green "Connected" summary on integrations cards. After login restore the list
 * snapshot arrives before per-service migration health; avoid flashing the
 * replacement form while background refresh is in flight.
 */
export function shouldShowConnectedSummaryCard(
  connectionStatus: string,
  migrationInfo: DatabaseConnectionMigrationInfo | null | undefined,
  options: { migrationSnapshotLoaded: boolean }
): boolean {
  if (connectionStatus !== 'connected') {
    return false;
  }
  if (isSetupComplete(migrationInfo)) {
    return true;
  }
  if (!options.migrationSnapshotLoaded && migrationInfo == null) {
    return true;
  }
  return false;
}

export function setupOutcomeFromSave(
  saved: Pick<DatabaseConnectionInfo, 'status' | 'setup'>
): SetupOutcomeState {
  if (saved.status === 'invalid') {
    return { outcome: 'failed', failedPhase: 'connecting' };
  }
  if (saved.status !== 'connected') {
    return { outcome: 'in_progress' };
  }
  if (!saved.setup) {
    return { outcome: 'in_progress' };
  }
  if (saved.setup.migration_status === 'failed') {
    return { outcome: 'failed', failedPhase: 'setting_up' };
  }
  if (isSetupComplete(saved.setup)) {
    return { outcome: 'succeeded' };
  }
  return { outcome: 'in_progress' };
}

export function areAllServicesSetupComplete(
  migrations: DatabaseConnectionMigrationStatusResponse | null | undefined
): boolean {
  if (!migrations?.services.length) return false;
  return DATABASE_CONNECTION_SERVICES.every((service) => {
    const info = migrations.services.find((entry) => entry.service === service);
    return info?.connection_status === 'connected' && isSetupComplete(info);
  });
}

export type RetryCardState = 'invalid' | 'setup_failed' | 'pending_migrations';

/** Starting setup phase when the user clicks Retry on a card. */
export function resolveRetryStartPhase(cardState: RetryCardState): DatabaseSetupPhase {
  if (cardState === 'invalid') {
    return 'validating';
  }
  return 'setting_up';
}

export function mergeConnectionStatusForService(
  current: Record<DatabaseConnectionService, ConnectionUiStatus>,
  service: DatabaseConnectionService,
  connection: { status: string } | undefined
): Record<DatabaseConnectionService, ConnectionUiStatus> {
  return {
    ...current,
    [service]: connectionUiStatusFromApi(connection),
  };
}

export function mergeMigrationRunForService(
  current: DatabaseConnectionMigrationStatusResponse | null,
  runInfo: DatabaseConnectionMigrationRunInfo
): DatabaseConnectionMigrationStatusResponse {
  const serviceMigration: DatabaseConnectionMigrationInfo = {
    service: runInfo.service,
    connection_status: 'connected',
    pending_count: runInfo.pending_count,
    failed_count: runInfo.status === 'failed' ? 1 : 0,
    latest_version: null,
    latest_status: runInfo.status === 'failed' ? 'failed' : runInfo.applied_count > 0 ? 'applied' : 'pending',
    latest_updated_at: null,
  };
  return mergeMigrationStatusForService(current, serviceMigration);
}

export function connectionSetupNotice(saved: DatabaseConnectionInfo): string | null {
  if (saved.setup?.message) {
    return saved.setup.message;
  }
  if (saved.status === 'invalid') {
    return (
      saved.setup?.error ??
      'Rails could not open a working database pool for this connection string.'
    );
  }
  return null;
}
