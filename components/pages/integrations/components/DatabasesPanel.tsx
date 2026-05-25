'use client';

import DatabaseConnectionCard from '@/components/pages/integrations/components/DatabaseConnectionCard';
import Banner from '@/components/molecules/Banner';
import PrimaryButton from '@/components/atoms/PrimaryButton/PrimaryButton';
import MaterialIcon from '@/components/atoms/MaterialIcon/MaterialIcon';
import {
  useDatabaseConnections,
  type ConnectionKey,
} from '@/components/pages/integrations/hooks/useDatabaseConnections';
import { useTransientSuccess } from '@/components/pages/integrations/hooks/useTransientSuccess';
import {
  type MigrationAlertTone,
  unchangedConnectionNotice,
} from '@/lib/databaseConnectionSetup';
import { hasAllMigrationTargets } from '@/lib/databaseReadiness';
import type {
  DatabaseConnectionMigrationStatusResponse,
  DatabaseConnectionsResponse,
} from '@/lib/api';

interface DatabaseDescriptor {
  key: ConnectionKey;
  title: string;
  description: string;
  placeholder: string;
  icon: string;
  accentClassName: string;
}

const DATABASES: DatabaseDescriptor[] = [
  {
    key: 'accounts',
    title: 'Accounts Database',
    description: 'Manage and view user accounts, balances, and transactional limits.',
    placeholder: 'postgres://user:password@host:port/accounts',
    icon: 'account_balance',
    accentClassName:
      'bg-blue-50 text-blue-600 dark:border dark:border-blue-800/80 dark:bg-blue-950/90 dark:text-blue-200',
  },
  {
    key: 'users',
    title: 'Users Database',
    description: 'Store and manage end-user identities, KYC states, and profile details.',
    placeholder: 'postgres://user:password@host:port/users',
    icon: 'group',
    accentClassName:
      'bg-emerald-50 text-emerald-600 dark:border dark:border-emerald-800/80 dark:bg-emerald-950/90 dark:text-emerald-200',
  },
  {
    key: 'ledger',
    title: 'Ledger Database',
    description: 'Maintains an immutable, double-entry record of all financial transactions.',
    placeholder: 'postgres://user:password@host:port/ledger',
    icon: 'book',
    accentClassName:
      'bg-violet-50 text-violet-600 dark:border dark:border-violet-800/80 dark:bg-violet-950/90 dark:text-violet-200',
  },
  {
    key: 'audit',
    title: 'Audit Services Database',
    description: 'Stores compliance logs, API request traces, and system access history.',
    placeholder: 'postgres://user:password@host:port/audit',
    icon: 'verified_user',
    accentClassName:
      'bg-amber-50 text-amber-700 dark:border dark:border-amber-800/80 dark:bg-amber-950/90 dark:text-amber-200',
  },
];

const SERVICE_KEYS = DATABASES.map((d) => d.key) as readonly ConnectionKey[];

interface Session {
  access_token: string;
  environment_id: string;
  environments?: { id: string; type: string }[];
}

interface DatabasesPanelProps {
  session?: Session | null;
  environment: string;
  currentEnvironmentId: string | null;
  isProductionUnavailable: boolean;
  updateOnboardingStep: (step: 'dbsConnected', value: boolean) => void;
  onMigrationStatusChange?: (status: DatabaseConnectionMigrationStatusResponse) => void;
  onDatabaseHealthChange?: (status: DatabaseConnectionsResponse) => void;
}

interface MigrationToneArgs {
  isConnectedPool: boolean;
  isSetupFailed: boolean;
  status: string;
  failedCount?: number;
  pendingCount?: number;
  latestStatus?: string | null;
  serviceNotice: string | null;
}

function migrationToneFor({
  isConnectedPool,
  isSetupFailed,
  failedCount,
  pendingCount,
  latestStatus,
  serviceNotice,
}: MigrationToneArgs): MigrationAlertTone {
  let tone: MigrationAlertTone;
  if (!isConnectedPool || latestStatus === 'not_connected') tone = 'neutral';
  else if (failedCount || isSetupFailed) tone = 'danger';
  else if (pendingCount) tone = 'warning';
  else if (latestStatus === 'applied') tone = 'success';
  else tone = 'neutral';
  if (serviceNotice === unchangedConnectionNotice()) tone = 'warning';
  return tone;
}

interface MigrationCopyArgs {
  isSettingUp: boolean;
  isConnectedPool: boolean;
  isSetupFailed: boolean;
  status: string;
  serviceNotice: string | null;
  failedCount?: number;
  pendingCount?: number;
  latestStatus?: string | null;
}

function migrationCopyFor({
  isSettingUp,
  isConnectedPool,
  isSetupFailed,
  status,
  serviceNotice,
  failedCount,
  pendingCount,
  latestStatus,
}: MigrationCopyArgs): string {
  if (isSettingUp) return 'Schema setup runs after the connection pool is ready.';
  if (serviceNotice && (isConnectedPool || isSetupFailed)) return serviceNotice;
  if (!isConnectedPool && !isSetupFailed && status !== 'connected') {
    return 'Migrations will be checked after this database is connected.';
  }
  if (failedCount) {
    return isSetupFailed
      ? 'A schema migration failed. Use Retry to run setup again, or Edit to replace the connection string.'
      : 'A schema migration failed. Use Apply updates to retry, or check your database logs.';
  }
  if (pendingCount) {
    return `${pendingCount} optional schema update${pendingCount === 1 ? '' : 's'} available for this database. Use Apply updates when you want the latest platform schema.`;
  }
  if (latestStatus === 'applied') return 'Schema migrations are applied for this database.';
  return 'Rails is checking the schema state for this database.';
}

export default function DatabasesPanel(props: DatabasesPanelProps) {
  const conns = useDatabaseConnections({
    session: props.session,
    environment: props.environment,
    currentEnvironmentId: props.currentEnvironmentId,
    serviceKeys: SERVICE_KEYS,
    isProductionUnavailable: props.isProductionUnavailable,
    updateOnboardingStep: props.updateOnboardingStep,
    onMigrationStatusChange: props.onMigrationStatusChange,
    onDatabaseHealthChange: props.onDatabaseHealthChange,
  });
  const transient = useTransientSuccess(SERVICE_KEYS);

  const pendingMigrationCount =
    conns.migrationStatus?.services.reduce(
      (t, s) => t + s.pending_count + s.failed_count,
      0
    ) ?? 0;
  const appliedMigrationCount =
    conns.migrationRunResult?.services.reduce((t, s) => t + s.applied_count, 0) ?? 0;

  return (
    <>
      <section
        id="integrations-panel-databases"
        role="tabpanel"
        aria-labelledby="integrations-tab-databases"
      >
        <div className="mb-2">
          <h2 className="text-2xl font-medium tracking-tight text-black dark:text-white">
            Database Connections
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          You own your data. Connect to a PostgreSQL provider of your choice to store your core
          banking data securely on your own infrastructure. We recommend{' '}
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-900 underline decoration-dotted decoration-zinc-300 underline-offset-2 transition-colors hover:text-black hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:text-white dark:hover:decoration-zinc-500"
          >
            Neon
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          for its seamless serverless architecture and branching capabilities.
        </p>
        <div className="mt-6">
          <Banner tone="info" icon="security" title="Encrypted Storage">
            Connection strings are encrypted before they are stored and decrypted only when Rails
            validates or migrates your service databases.
          </Banner>
        </div>
      </section>

      <div className="space-y-6">
        {props.isProductionUnavailable ? (
          <Banner tone="warning" testId="integrations-production-unavailable" size="sm">
            Production is not provisioned for this business yet. Switch to Sandbox to configure
            database connections.
          </Banner>
        ) : null}
        {conns.error ? (
          <Banner tone="danger" testId="integrations-page-error" size="sm">
            {conns.error}
          </Banner>
        ) : null}
        {hasAllMigrationTargets(conns.migrationStatus) &&
        conns.migrationStatus?.has_pending_updates ? (
          <Banner
            tone="warning"
            icon="database"
            title="Database updates available"
            action={
              <PrimaryButton
                onClick={conns.handleRunMigrations}
                disabled={conns.interactionsLocked}
                loading={conns.isRunningMigrations}
                loadingText="Applying…"
              >
                <MaterialIcon name="play_arrow" size={16} />
                Apply updates
              </PrimaryButton>
            }
          >
            {pendingMigrationCount === 1
              ? '1 database schema update is ready to apply.'
              : `${pendingMigrationCount} database schema updates are ready to apply.`}
          </Banner>
        ) : null}
        {conns.migrationRunResult ? (
          <Banner
            tone={conns.migrationRunResult.has_failures ? 'danger' : 'success'}
            size="sm"
          >
            {conns.migrationRunResult.has_failures
              ? 'Some migrations failed. Review the affected service connection and try again.'
              : appliedMigrationCount === 0
                ? 'All connected service databases are already up to date.'
                : `${appliedMigrationCount} schema update${appliedMigrationCount === 1 ? '' : 's'} applied successfully.`}
          </Banner>
        ) : null}

        {DATABASES.map((descriptor) => {
          const status = conns.status[descriptor.key];
          const setupPhase = conns.setupPhases[descriptor.key];
          const setupOutcome = conns.setupOutcomes[descriptor.key];
          const hasSavedConnection = conns.savedConnectionKeys.has(descriptor.key);
          const isEditingFlag = conns.isEditingConnection[descriptor.key];
          const serviceNotice = conns.connectionNotices[descriptor.key];
          const migrationInfo = conns.migrationStatus?.services.find(
            (s) => s.service === descriptor.key
          );
          const isSettingUp = setupPhase !== null;
          const isAnotherCardSettingUp = Object.entries(conns.setupPhases).some(
            ([k, p]) => p !== null && k !== descriptor.key
          );
          const isRetryDisabled =
            conns.interactionsLocked || isAnotherCardSettingUp || conns.retryingService !== null;
          const isConnectedPool =
            status === 'connected' && conns.initialCheckComplete && !isSettingUp;
          const isSetupFailed =
            status === 'connected' &&
            (setupOutcome?.outcome === 'failed' || migrationInfo?.latest_status === 'failed');
          const isMissing =
            !hasSavedConnection &&
            !isSettingUp &&
            (status === 'missing' || status === 'idle');
          const isEditing = (isEditingFlag || isMissing) && !isSettingUp;

          const tone = migrationToneFor({
            isConnectedPool,
            isSetupFailed: Boolean(isSetupFailed),
            status,
            failedCount: migrationInfo?.failed_count,
            pendingCount: migrationInfo?.pending_count,
            latestStatus: migrationInfo?.latest_status,
            serviceNotice,
          });

          transient.observeTone(descriptor.key, tone);

          const transientState = transient.state[descriptor.key];
          const showFooter =
            tone === 'danger' ||
            tone === 'warning' ||
            (tone === 'success' && transientState !== 'gone');

          const text = migrationCopyFor({
            isSettingUp,
            isConnectedPool,
            isSetupFailed: Boolean(isSetupFailed),
            status,
            serviceNotice,
            failedCount: migrationInfo?.failed_count,
            pendingCount: migrationInfo?.pending_count,
            latestStatus: migrationInfo?.latest_status,
          });

          return (
            <DatabaseConnectionCard
              key={descriptor.key}
              descriptor={descriptor}
              value={conns.connections[descriptor.key]}
              onChange={(v) => conns.handleChange(descriptor.key, v)}
              onCopy={conns.handleCopy}
              onConnect={() => void conns.handleConnect(descriptor.key)}
              onEdit={() => conns.handleEditConnection(descriptor.key)}
              onCancelEdit={() => conns.handleCancelEdit(descriptor.key)}
              onRetry={() => void conns.handleRetryConnection(descriptor.key)}
              status={status}
              setupPhase={setupPhase}
              setupOutcome={setupOutcome}
              hasSavedConnection={hasSavedConnection}
              isEditing={isEditing}
              initialCheckComplete={conns.initialCheckComplete}
              interactionsLocked={conns.interactionsLocked}
              isRetryDisabled={isRetryDisabled}
              isSubmitting={conns.savingService === descriptor.key}
              serviceNotice={serviceNotice}
              migrationFooterTone={tone}
              migrationFooterText={text}
              migrationFooterVisible={showFooter}
            />
          );
        })}
      </div>
    </>
  );
}
