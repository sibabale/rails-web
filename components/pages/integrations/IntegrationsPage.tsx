'use client';

import { useMemo, useState } from 'react';
import IntegrationsTabs from '@/components/pages/integrations/components/IntegrationsTabs';
import DatabasesPanel from '@/components/pages/integrations/components/DatabasesPanel';
import ApiKeyPanel from '@/components/pages/integrations/components/ApiKeyPanel';
import { useIntegrationsTab } from '@/components/pages/integrations/hooks/useIntegrationsTab';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAppSelector } from '@/state/hooks';
import { resolveEnvironmentId } from '@/lib/environment';
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
  const environment = useAppSelector((state) => state.environment.current);
  const currentEnvironmentId = resolveEnvironmentId(session, environment);
  const isProductionUnavailable = environment === 'production' && !currentEnvironmentId;
  const { state: onboardingState, updateStep } = useOnboarding(currentEnvironmentId);

  const [latestMigrationStatus, setLatestMigrationStatus] =
    useState<DatabaseConnectionMigrationStatusResponse | null>(null);

  const pendingMigrationCount = useMemo(
    () =>
      latestMigrationStatus?.services.reduce(
        (t, s) => t + s.pending_count + s.failed_count,
        0
      ) ?? 0,
    [latestMigrationStatus]
  );

  const handleMigrationStatusChange = (status: DatabaseConnectionMigrationStatusResponse) => {
    setLatestMigrationStatus(status);
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
          migrationsApplied={onboardingState.migrationsApplied}
          pendingMigrationCount={pendingMigrationCount}
          onSwitchToDatabases={() => tab.select('databases')}
          updateOnboardingStep={updateStep}
        />
      )}
    </div>
  );
}
