'use client';
import IntegrationsTabs from '@/components/pages/integrations/components/IntegrationsTabs';
import DatabasesPanel from '@/components/pages/integrations/components/DatabasesPanel';
import ApiKeyPanel from '@/components/pages/integrations/components/ApiKeyPanel';
import { useIntegrationsTab } from '@/components/pages/integrations/hooks/useIntegrationsTab';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  selectMigrationUpdatesForEnvironment,
  setMigrationUpdatesForEnvironment,
} from '@/state/slices/migrationsSlice';
import { resolveEnvironmentId } from '@/lib/environment';
import {
  hasUpdatesAvailableFor,
  pendingMigrationCountFor,
} from '@/lib/migrationUpdates';
import type {
  DatabaseConnectionMigrationStatusResponse,
  DatabaseConnectionsResponse,
} from '@/lib/api';

interface IntegrationsPageProps {
  session?: {
    access_token: string;
    environment_id: string;
    environments?: { id: string; type: string }[];
  } | null;
  onMigrationStatusChange?: (status: DatabaseConnectionMigrationStatusResponse) => void;
  onDatabaseHealthChange?: (status: DatabaseConnectionsResponse) => void;
}

export default function IntegrationsPage({
  session,
  onMigrationStatusChange,
  onDatabaseHealthChange,
}: IntegrationsPageProps) {
  const tab = useIntegrationsTab();
  const dispatch = useAppDispatch();
  const environment = useAppSelector((state) => state.environment.current);
  const currentEnvironmentId = resolveEnvironmentId(session, environment);
  const pendingMigrationCount = useAppSelector((state) =>
    selectMigrationUpdatesForEnvironment(state, currentEnvironmentId).pendingMigrationCount
  );
  const isProductionUnavailable = environment === 'production' && !currentEnvironmentId;
  const { state: onboardingState, updateStep } = useOnboarding(currentEnvironmentId);

  const handleMigrationStatusChange = (status: DatabaseConnectionMigrationStatusResponse) => {
    const pendingMigrationCount = pendingMigrationCountFor(status);
    const hasUpdatesAvailable = hasUpdatesAvailableFor(status);
    if (currentEnvironmentId) {
      dispatch(
        setMigrationUpdatesForEnvironment({
          environmentId: currentEnvironmentId,
          pendingMigrationCount,
          hasUpdatesAvailable,
        })
      );
    }
    onMigrationStatusChange?.(status);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <IntegrationsTabs active={tab.active} onSelect={tab.select} />

      {tab.active === 'databases' ? (
        <DatabasesPanel
          session={session}
          environment={environment}
          currentEnvironmentId={currentEnvironmentId}
          isProductionUnavailable={isProductionUnavailable}
          updateOnboardingStep={updateStep}
          onMigrationStatusChange={handleMigrationStatusChange}
          onDatabaseHealthChange={onDatabaseHealthChange}
        />
      ) : (
        <ApiKeyPanel
          session={session}
          dbsConnected={onboardingState.dbsConnected}
          initialMigrationsApplied={onboardingState.initialMigrationsApplied}
          pendingMigrationCount={pendingMigrationCount}
          onSwitchToDatabases={() => tab.select('databases')}
          updateOnboardingStep={updateStep}
        />
      )}
    </div>
  );
}
