'use client';

import { useCallback } from 'react';
import ApiKeyManager from '@/components/ApiKeyManager';
import Banner from '@/components/molecules/Banner/Banner';
import SecondaryButton from '@/components/atoms/SecondaryButton/SecondaryButton';
import { isMigrationStatusCurrent } from '@/lib/databaseReadiness';
import type { DatabaseConnectionMigrationStatusResponse } from '@/lib/api';

interface Session {
  access_token: string;
  environment_id: string;
  environments?: { id: string; type: string }[];
}

interface ApiKeyPanelProps {
  session?: Session | null;
  dbsConnected: boolean;
  migrationStatus: DatabaseConnectionMigrationStatusResponse | null;
  pendingMigrationCount: number;
  onSwitchToDatabases: () => void;
  updateOnboardingStep: (step: 'apiKeyGenerated', value: boolean) => void;
}

export default function ApiKeyPanel({
  session,
  dbsConnected,
  migrationStatus,
  pendingMigrationCount,
  onSwitchToDatabases,
  updateOnboardingStep,
}: ApiKeyPanelProps) {
  const canCreateApiKey = dbsConnected && isMigrationStatusCurrent(migrationStatus);

  const blockedReason = !dbsConnected
    ? 'Connect all required database integrations before creating an API key.'
    : !isMigrationStatusCurrent(migrationStatus)
      ? 'Apply database updates before creating an API key.'
      : 'Complete setup before creating an API key.';

  const blockedBanner = !canCreateApiKey
    ? !dbsConnected
      ? {
          title: 'Database setup required',
          body: 'API key creation is disabled until every required database is connected for this environment. Connect Accounts, Users, Ledger, and Audit on the Databases tab, then return here to issue a key.',
        }
      : !isMigrationStatusCurrent(migrationStatus)
        ? {
            title: 'Database updates required',
            body:
              pendingMigrationCount > 0
                ? `Connected databases still need ${pendingMigrationCount} schema update${pendingMigrationCount === 1 ? '' : 's'}. Open the Databases tab and choose Apply updates, then return here to create a key.`
                : 'API key creation is disabled until schema migration status is confirmed for every service. Open the Databases tab, wait for migration checks to finish, apply any available updates, then return here.',
          }
        : {
            title: 'Setup incomplete',
            body: 'API key creation is disabled until database setup is complete for this environment.',
          }
    : null;

  const handleActiveKeyChange = useCallback(
    (hasActiveKey: boolean) => updateOnboardingStep('apiKeyGenerated', hasActiveKey),
    [updateOnboardingStep]
  );

  return (
    <div
      id="integrations-panel-api-key"
      role="tabpanel"
      aria-labelledby="integrations-tab-api-key"
      className="space-y-6"
    >
      {blockedBanner ? (
        <Banner
          tone="warning"
          icon="info"
          title={blockedBanner.title}
          role="status"
          testId="api-key-creation-blocked-banner"
          action={
            <SecondaryButton tone="warning" onClick={onSwitchToDatabases}>
              Go to Databases
            </SecondaryButton>
          }
        >
          {blockedBanner.body}
        </Banner>
      ) : null}
      <ApiKeyManager
        session={session}
        canCreate={canCreateApiKey}
        blockedReason={blockedReason}
        onActiveKeyChange={handleActiveKeyChange}
      />
    </div>
  );
}
