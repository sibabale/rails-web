import type { Route } from '@playwright/test';

export type DatabaseConnectionService = 'accounts' | 'users' | 'ledger' | 'audit';

type ConnectionStatus = 'missing' | 'connected' | 'invalid';

const REQUIRED_SERVICES: DatabaseConnectionService[] = ['accounts', 'users', 'ledger', 'audit'];

export const SEED_CONNECTION_STRING = 'postgres://rails:e2e@db.example.com:5432';

const defaultConnections = (): Record<DatabaseConnectionService, ConnectionStatus> => ({
  accounts: 'missing',
  users: 'missing',
  ledger: 'missing',
  audit: 'missing',
});

const defaultStoredConnectionStrings = (): Record<DatabaseConnectionService, string | null> => ({
  accounts: null,
  users: null,
  ledger: null,
  audit: null,
});

let connections = defaultConnections();
let storedConnectionStrings = defaultStoredConnectionStrings();
let migrationsApplied = false;
let dbsSetupCompletedAt: string | null = null;
let invalidateAccountsOnValidate = false;
let recoverInvalidServiceOnValidate: DatabaseConnectionService | null = null;
let failMigrationRunForService: DatabaseConnectionService | null = null;
let migrationRunFailures = new Set<DatabaseConnectionService>();
let migrationRunApplied = new Set<DatabaseConnectionService>();

export function resetDatabaseMockState() {
  window.connections = defaultConnections();
  window.storedConnectionStrings = defaultStoredConnectionStrings();
  window.migrationsApplied = false;
  window.dbsSetupCompletedAt = null;
  window.invalidateAccountsOnValidate = false;
  window.recoverInvalidServiceOnValidate = null;
  window.failMigrationRunForService = null;
  window.migrationRunFailures = new Set();
  window.migrationRunApplied = new Set();
}

/** Seed returning-user state for login-restore E2E scenarios. */
export function seedSavedConnectedDatabases(options?: {
  migrationsApplied?: boolean;
  withMilestone?: boolean;
}) {
  for (const service of REQUIRED_SERVICES) {
    connections[service] = 'connected';
    storedConnectionStrings[service] = `${SEED_CONNECTION_STRING}/${service}`;
  }
  migrationsApplied = options?.migrationsApplied ?? true;
  if (options?.withMilestone ?? migrationsApplied) {
    dbsSetupCompletedAt = new Date().toISOString();
  }
}

export function setInvalidateAccountsOnValidate(value: boolean) {
  window.invalidateAccountsOnValidate = value;
}

export function setFailMigrationRunForService(service: DatabaseConnectionService | null) {
  window.failMigrationRunForService = service;
}

/** Flips one invalid service back to connected on the next POST validate (retry E2E). */
export function setRecoverInvalidServiceOnValidate(service: DatabaseConnectionService | null) {
  recoverInvalidServiceOnValidate = service;
}

/** Partial BYOD: one connected, one invalid (saved), two never connected — RAI-48 banner/card sync. */
;(function() {
  function seedPartialDatabaseConnections(options?: { withMilestone?: boolean }) {
    connections.accounts = 'connected';
    connections.users = 'invalid';
    connections.ledger = 'missing';
    connections.audit = 'missing';
    storedConnectionStrings.accounts = `${SEED_CONNECTION_STRING}/accounts`;
    storedConnectionStrings.users = `${SEED_CONNECTION_STRING}/users`;
    storedConnectionStrings.ledger = null;
    storedConnectionStrings.audit = null;
    migrationsApplied = true;
    dbsSetupCompletedAt = options?.withMilestone === false ? null : new Date().toISOString();
  }
  window.seedPartialDatabaseConnections = seedPartialDatabaseConnections;
})();

const isInvalidConnectionString = (value: string) =>
  value.includes('@invalid-host') || value.includes('postgres://invalid');

const persistDbsSetupIfReady = () => {
  if (dbsSetupCompletedAt) return;
  const allConnected = REQUIRED_SERVICES.every((service) => connections[service] === 'connected');
  // Mirrors the backend's `baseline_milestone_ready` invariant: every
  // required service must be connected AND have at least one applied
  // baseline migration. The mock collapses "baseline applied" into
  // `migrationsApplied` (it has no per-service tracking).
  if (allConnected && migrationsApplied) {
    dbsSetupCompletedAt = new Date().toISOString();
  }
};

const buildConnectionsResponse = () => {
  persistDbsSetupIfReady();
  const list = REQUIRED_SERVICES.map((service) => ({
    service,
    status: connections[service],
    last_validated_at: connections[service] === 'connected' ? new Date().toISOString() : null,
    updated_at: connections[service] === 'connected' ? new Date().toISOString() : null,
  }));
  return {
    all_connected: list.every((item) => item.status === 'connected'),
    connections: list,
    dbs_setup_completed_at: dbsSetupCompletedAt,
  };
};

const buildMigrationStatus = () => {
  persistDbsSetupIfReady();
export async function tryHandleDatabaseConnectionsRoute(
  route: Route,
  fulfillJson: (route: Route, body: unknown, status?: number) => Promise<void>,
): Promise<boolean> {
  const req = route.request();
  const url = new URL(req.url());
  const path = url.pathname;
  const method = req.method();

  const handlers: Record<string, () => Promise<boolean>> = {
    'GET /api/v1/database-connections': async () => {
      await fulfillJson(route, buildConnectionsResponse());
      return true;
    },
    'POST /api/v1/database-connections': async () => {
      const body = await parseJsonBody(route);
      const service = body.service as DatabaseConnectionService | undefined;
      const connectionString = String(body.connection_string ?? '');
      if (!service || !REQUIRED_SERVICES.includes(service)) {
        await fulfillJson(route, { message: 'Invalid database service' }, 400);
        return true;
      }
      if (!connectionString.trim()) {
        await fulfillJson(route, { message: 'Connection string is required' }, 400);
        return true;
      }
    },
  };

  const key = `${method} ${path}`;
  if (handlers[key]) {
    return await handlers[key]();
  }

  // rest of the original function...

    const trimmed = connectionString.trim();
    const stored = storedConnectionStrings[service];
    if (connections[service] === 'connected' && stored && stored.trim() === trimmed) {
      await fulfillJson(route, {
        service,
        status: 'connected',
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unchanged: true,
      });
      return true;
    }

    connections[service] = isInvalidConnectionString(connectionString) ? 'invalid' : 'connected';
    if (connections[service] === 'connected') {
      storedConnectionStrings[service] = trimmed;
      migrationsApplied = false;
    }
    persistDbsSetupIfReady();

    const migrationFailed = connections[service] === 'connected' && connectionString.includes('migration-fail');
    const poolFailed = connections[service] === 'invalid';

    await fulfillJson(route, {
      service,
      status: connections[service] === 'invalid' ? 'invalid' : 'connected',
      last_validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      setup: poolFailed
        ? {
            migration_status: 'failed',
            pending_count: 0,
            applied_count: 0,
            error: 'connection refused',
            message: 'Rails could not open a working database pool for this connection string.',
          }
        : migrationFailed
          ? {
              migration_status: 'failed',
              pending_count: 2,
              applied_count: 0,
              error: 'permission denied for schema public',
              message:
                'Your database connection is active, but required schema setup could not finish. Use Apply updates or replace the connection string to retry.',
            }
          : {
              migration_status: 'applied',
              pending_count: 0,
              applied_count: 1,
              error: null,
              message: null,
            },
    });
    return true;
  }

  if (method === 'POST' && path === '/api/v1/database-connections/validate') {
    if (invalidateAccountsOnValidate) {
      connections.accounts = 'invalid';
    }
    if (
      recoverInvalidServiceOnValidate &&
      connections[recoverInvalidServiceOnValidate] === 'invalid'
    ) {
      connections[recoverInvalidServiceOnValidate] = 'connected';
      storedConnectionStrings[recoverInvalidServiceOnValidate] =
        storedConnectionStrings[recoverInvalidServiceOnValidate] ??
        `${SEED_CONNECTION_STRING}/${recoverInvalidServiceOnValidate}`;
      recoverInvalidServiceOnValidate = null;
    }
    await fulfillJson(route, buildConnectionsResponse());
    return true;
  }

  if (method === 'GET' && path === '/api/v1/database-connections/migrations') {
    await fulfillJson(route, buildMigrationStatus());
    return true;
  }

  if (method === 'POST' && path === '/api/v1/database-connections/migrations/run') {
    const connectedServices = REQUIRED_SERVICES.filter(
      (service) => connections[service] === 'connected'
    );
    if (connectedServices.length === 0) {
      await fulfillJson(route, { message: 'Connect all required databases first.' }, 400);
      return true;
    }

    const failedService = failMigrationRunForService;
    migrationRunFailures = new Set();
    migrationRunApplied = new Set();
    const services = connectedServices.map((service) => {
      if (failedService === service) {
        migrationRunFailures.add(service);
        return {
          service,
          status: 'failed',
          pending_count: 1,
          applied_count: 0,
          error: 'permission denied for schema public',
        };
      }
      migrationRunApplied.add(service);
      return {
        service,
        status: 'applied',
        pending_count: 0,
        applied_count: 1,
        error: null,
      };
    });

    if (!failedService) {
      migrationsApplied = true;
    }

    await fulfillJson(route, {
      has_failures: failedService !== null,
      services,
    });
    return true;
  }

  if (method === 'POST' && path === '/api/v1/api-keys') {
    const summary = buildConnectionsResponse();
    const migrations = buildMigrationStatus();
    if (!summary.all_connected) {
      await fulfillJson(
        route,
        { message: 'Connect all required database integrations before creating an API key.' },
        400,
      );
      return true;
    }
    if (migrations.services.some((service) => service.latest_status !== 'applied')) {
      await fulfillJson(route, { message: 'Apply database updates before creating an API key.' }, 400);
      return true;
    }

    await fulfillJson(route, {
      id: 'api-key-1',
      key: 'pk_e2e_plaintext_key',
      status: 'active',
    });
    return true;
  }

  return false;
}
