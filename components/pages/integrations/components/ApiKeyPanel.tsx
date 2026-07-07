'use client';

import { useCallback } from 'react';
import ApiKeyManager from '@/components/organisms/ApiKeyManager/ApiKeyManager';
import Banner from '@/components/molecules/Banner/Banner';
import SecondaryButton from '@/components/atoms/SecondaryButton/SecondaryButton';

interface Session {
  access_token: string;
  environment_id: string;
  environments?: { id: string; type: string }[];
}

interface ApiKeyPanelProps {
  session?: Session | null;
  dbsConnected: boolean;
  initialMigrationsApplied: boolean;
  pendingMigrationCount: number;
  onSwitchToDatabases: () => void;
  updateOnboardingStep: (step: 'apiKeyGenerated', value: boolean) => void;
}

export default function ApiKeyPanel({
  session,
  dbsConnected,
  initialMigrationsApplied,
  pendingMigrationCount,
  onSwitchToDatabases,
  updateOnboardingStep,
}: ApiKeyPanelProps) {
  const canCreateApiKey = dbsConnected && initialMigrationsApplied;

  const blockedReason = !dbsConnected
    ? 'Connect all required database integrations before creating an API key.'
    : !initialMigrationsApplied
      ? 'Complete initial database setup before creating an API key.'
      : 'Complete setup before creating an API key.';

  const blockedBanner = !canCreateApiKey
    ? !dbsConnected
      ? {
          title: 'Database setup required',
          body: 'API key creation is disabled until every required database is connected for this environment. Connect Accounts, Users, Ledger, and Audit on the Databases tab, then return here to issue a key.',
        }
      : !initialMigrationsApplied
        ? {
            title: 'Initial database setup required',
            body:
              pendingMigrationCount > 0
                ? `Connected databases still need ${pendingMigrationCount} initial update${pendingMigrationCount === 1 ? '' : 's'}. Open the Databases tab and choose Apply updates, then return here to create a key.`
                : 'API key creation is disabled until initial database setup is confirmed for every service. Open the Databases tab, wait for status checks to finish, apply available updates, then return here.',
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
