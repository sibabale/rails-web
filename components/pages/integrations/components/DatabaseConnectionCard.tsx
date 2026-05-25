'use client';

import DatabaseCardHeader from '@/components/pages/integrations/components/DatabaseCardHeader';
import DatabaseConnectionCardSkeleton from '@/components/pages/integrations/components/DatabaseConnectionCardSkeleton';
import DatabaseConnectionSetupProgress from '@/components/pages/integrations/components/DatabaseConnectionSetupProgress';
import ConnectionStringField from '@/components/molecules/ConnectionStringField';
import Banner, { type BannerTone } from '@/components/molecules/Banner';
import PrimaryButton from '@/components/atoms/PrimaryButton';
import SecondaryButton from '@/components/atoms/SecondaryButton';
import MaterialIcon from '@/components/atoms/MaterialIcon';
import {
  type DatabaseSetupPhase,
  type SetupOutcomeState,
  type MigrationAlertTone,
  computeIsCardStateReady,
  resolveMigrationAlertIcon,
} from '@/lib/databaseConnectionSetup';

interface DatabaseDescriptor {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  icon: string;
  accentClassName: string;
}

interface DatabaseConnectionCardProps {
  descriptor: DatabaseDescriptor;
  value: string;
  onChange: (value: string) => void;
  onCopy: (value: string) => void;
  onConnect: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onRetry: () => void;

  status: 'idle' | 'connecting' | 'connected' | 'invalid' | 'missing';
  setupPhase: DatabaseSetupPhase | null;
  setupOutcome: SetupOutcomeState | null;
  hasSavedConnection: boolean;
  isEditing: boolean;
  initialCheckComplete: boolean;
  interactionsLocked: boolean;
  isRetryDisabled: boolean;
  serviceNotice: string | null;
  migrationFooterTone: MigrationAlertTone;
  migrationFooterText: string;
  migrationFooterVisible: boolean;
}

const TONE_TO_BANNER: Record<MigrationAlertTone, BannerTone> = {
  neutral: 'neutral',
  warning: 'warning',
  danger: 'danger',
  success: 'success',
};

export default function DatabaseConnectionCard(props: DatabaseConnectionCardProps) {
  const {
    descriptor,
    value,
    onChange,
    onCopy,
    onConnect,
    onEdit,
    onCancelEdit,
    onRetry,
    status,
    setupPhase,
    setupOutcome,
    hasSavedConnection,
    isEditing,
    initialCheckComplete,
    interactionsLocked,
    isRetryDisabled,
    migrationFooterTone,
    migrationFooterText,
    migrationFooterVisible,
  } = props;

  const isSettingUp = setupPhase !== null;
  const isCardReady = computeIsCardStateReady(isSettingUp, initialCheckComplete);
  const isSetupFailed =
    status === 'connected' &&
    (setupOutcome?.outcome === 'failed' || migrationFooterTone === 'danger');
  const terminalFailedPhase = setupOutcome?.failedPhase ?? 'setting_up';
  const isConnectedPool = status === 'connected' && initialCheckComplete && !isSettingUp;
  const isInvalid = status === 'invalid' && initialCheckComplete && !isSettingUp;
  const showEditForm = isEditing;
  const connectLabel =
    isConnectedPool || isSetupFailed || (isEditing && hasSavedConnection) ? 'Save' : 'Connect';
  const saveDisabled = interactionsLocked || !value.trim();

  return (
    <section className="border border-zinc-200 bg-white p-6 transition-colors dark:border-zinc-800 dark:bg-[#050505]">
      <DatabaseCardHeader
        title={descriptor.title}
        description={descriptor.description}
        icon={descriptor.icon}
        accentClassName={descriptor.accentClassName}
      />

      {!isCardReady ? (
        <DatabaseConnectionCardSkeleton testId={`database-connection-skeleton-${descriptor.key}`} />
      ) : isSettingUp ? (
        <DatabaseConnectionSetupProgress phase={setupPhase!} title={descriptor.title} />
      ) : showEditForm ? (
        <div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3">
            <ConnectionStringField
              name={descriptor.key}
              value={value}
              placeholder={
                isConnectedPool
                  ? 'Paste a replacement PostgreSQL connection string'
                  : descriptor.placeholder
              }
              ariaLabel={`${descriptor.title} connection string`}
              onChange={onChange}
              onCopy={onCopy}
            />
            <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
              <PrimaryButton onClick={onConnect} disabled={saveDisabled}>
                {connectLabel}
              </PrimaryButton>
              {isConnectedPool || isSetupFailed ? (
                <SecondaryButton onClick={onCancelEdit} disabled={interactionsLocked}>
                  Cancel
                </SecondaryButton>
              ) : null}
            </div>
          </div>
          {isConnectedPool || isSetupFailed ? (
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {isSetupFailed
                ? 'Replace the connection string to retry schema setup after updating database access.'
                : 'The current encrypted connection remains active until this replacement validates successfully.'}
            </p>
          ) : null}
        </div>
      ) : isSetupFailed ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="min-w-0 flex-1">
            <DatabaseConnectionSetupProgress
              phase={terminalFailedPhase}
              outcome="failed"
              failedPhase={terminalFailedPhase}
              title={descriptor.title}
            />
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
            <SecondaryButton tone="danger" onClick={onRetry} disabled={isRetryDisabled}>
              <MaterialIcon name="refresh" size={16} /> Retry
            </SecondaryButton>
            <SecondaryButton tone="danger" onClick={onEdit} disabled={interactionsLocked}>
              <MaterialIcon name="edit" size={16} /> Edit
            </SecondaryButton>
          </div>
        </div>
      ) : isInvalid ? (
        <Banner
          tone="danger"
          icon="error"
          title="Needs attention"
          action={
            <div className="flex w-full flex-col gap-2 lg:w-auto">
              <SecondaryButton tone="danger" onClick={onRetry} disabled={isRetryDisabled}>
                <MaterialIcon name="refresh" size={16} /> Retry
              </SecondaryButton>
              <SecondaryButton tone="danger" onClick={onEdit} disabled={interactionsLocked}>
                <MaterialIcon name="edit" size={16} /> Edit
              </SecondaryButton>
            </div>
          }
        >
          The saved encrypted connection did not validate. Retry after the provider recovers, or
          replace the connection string.
        </Banner>
      ) : isConnectedPool ? (
        <Banner
          tone="success"
          icon="check_circle"
          title="Connected"
          testId={`database-connection-connected-${descriptor.key}`}
          action={
            <SecondaryButton tone="success" onClick={onEdit} disabled={interactionsLocked}>
              <MaterialIcon name="edit" size={16} /> Edit
            </SecondaryButton>
          }
        >
          The connection string is encrypted and hidden. Replace it only when you need to rotate or
          update database access.
        </Banner>
      ) : null}

      {migrationFooterVisible ? (
        <div className="mt-4">
          <Banner
            tone={TONE_TO_BANNER[migrationFooterTone]}
            icon={resolveMigrationAlertIcon(migrationFooterTone)}
            role={
              migrationFooterTone === 'danger' || migrationFooterTone === 'warning'
                ? 'alert'
                : undefined
            }
            testId={`database-connection-migration-alert-${descriptor.key}`}
            size="sm"
          >
            {migrationFooterText}
          </Banner>
        </div>
      ) : null}
    </section>
  );
}
