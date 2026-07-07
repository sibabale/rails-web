import {
  buildConnectionsResponseFromStatuses,
  buildPostConnectRefreshState,
  delay,
  isUnchangedSaveResponse,
  shouldRunFullHealthRefreshAfterSave,
  type ConnectionUiStatus,
} from '@/lib/databaseConnectionSetup';
import { isDatabaseSetupCompletedFromBackend } from '@/lib/databaseSetupState';
import {
  databaseConnectionsApi,
  type DatabaseConnectionInfo,
  type DatabaseConnectionMigrationStatusResponse,
  type DatabaseConnectionService,
  type DatabaseConnectionsResponse,
} from '@/lib/api';

type ConnectionKey = DatabaseConnectionService;

export async function refreshIntegrationStateAfterSave(
  session: { access_token: string; environment_id: string },
  saved: DatabaseConnectionInfo,
  ctx: {
    statusRef: { current: Record<ConnectionKey, ConnectionUiStatus> };
    migrationStatusRef: { current: DatabaseConnectionMigrationStatusResponse | null };
    setMigrationStatus: (value: DatabaseConnectionMigrationStatusResponse) => void;
    onMigrationStatusChange?: (status: DatabaseConnectionMigrationStatusResponse) => void;
    onDatabaseHealthChange?: (status: DatabaseConnectionsResponse) => void;
    recomputeOnboarding: (
      summary: DatabaseConnectionsResponse,
      migrations: DatabaseConnectionMigrationStatusResponse
    ) => void;
    applyListSnapshot: (listed: DatabaseConnectionsResponse) => void;
  }
): Promise<void> {
  if (shouldRunFullHealthRefreshAfterSave(saved)) {
    const { summary, migrations: merged } = buildPostConnectRefreshState(
      saved,
      ctx.statusRef.current,
      ctx.migrationStatusRef.current
    );
    ctx.migrationStatusRef.current = merged;
    ctx.setMigrationStatus(merged);
    ctx.onMigrationStatusChange?.(merged);
    ctx.onDatabaseHealthChange?.(summary);
    ctx.recomputeOnboarding(summary, merged);

    if (summary.all_connected) {
      let listed: DatabaseConnectionsResponse | null = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          listed = await databaseConnectionsApi.list(session);
          ctx.applyListSnapshot(listed);
          if (isDatabaseSetupCompletedFromBackend(listed) || attempt === 4) {
            break;
          }
          await delay(1500);
        } catch {
          // Best effort: keep last known snapshot, stop polling on failure.
          break;
        }
      }
      if (listed && ctx.migrationStatusRef.current) {
        ctx.recomputeOnboarding(listed, ctx.migrationStatusRef.current);
      }
    }
    return;
  }

  if (isUnchangedSaveResponse(saved)) {
    return;
  }

  const migrations = await databaseConnectionsApi.migrations(session);
  ctx.migrationStatusRef.current = migrations;
  ctx.setMigrationStatus(migrations);
  ctx.onMigrationStatusChange?.(migrations);
  const summary = buildConnectionsResponseFromStatuses(ctx.statusRef.current);
  ctx.onDatabaseHealthChange?.(summary);
  ctx.recomputeOnboarding(summary, migrations);
}
