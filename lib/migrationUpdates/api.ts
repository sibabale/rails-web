import {
  databaseConnectionsApi,
  type DatabaseConnectionMigrationStatusResponse,
} from '@/lib/api';

interface Session {
  access_token: string;
  environment_id: string;
  environments?: { id: string; type: string }[];
}

export function fetchMigrationUpdatesStatus(
  session: Session | null
): Promise<DatabaseConnectionMigrationStatusResponse> {
  return databaseConnectionsApi.migrations(session);
}
