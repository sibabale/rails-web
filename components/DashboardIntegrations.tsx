'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ApiKeyManager from '@/components/ApiKeyManager';
import DatabaseConnectionCardSkeleton from '@/components/molecules/DatabaseConnectionCardSkeleton';
import DatabaseConnectionSetupProgress from '@/components/molecules/DatabaseConnectionSetupProgress';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  isDatabaseSetupCompletedFromBackend,
  markDatabaseSetupCompleted,
  readDatabaseSetupCompleted,
  resolveDbsConnectedOnboardingAction,
} from '@/lib/databaseSetupState';
import { hasAllMigrationTargets, isMigrationStatusCurrent } from '@/lib/databaseReadiness';
import {
  type DatabaseSetupPhase,
  type ConnectionUiStatus,
  buildConnectionsResponseFromStatuses,
  computeInteractionsLocked,
  computeIsCardStateReady,
  connectionSetupNotice,
  connectionUiStatusFromApi,
  isPostgresConnectionString,
  isUnchangedSaveResponse,
  mergeMigrationStatusForService,
  migrationInfoFromSetup,
  listSavedConnectionServices,
  savedConnectionKeysFromSummary,
  statusesFromListResponse,
  unchangedConnectionNotice,
  resolveMigrationAlertIcon,
  type MigrationAlertTone,
  setupOutcomeFromSave,
  type SetupOutcomeState,
  shouldShowConnectedSummaryCard,
  mergeConnectionStatusForService,
  mergeMigrationRunForService,
  resolveRetryStartPhase,
  type RetryCardState,
  waitForSetupPhaseVisible,
} from '@/lib/databaseConnectionSetup';
import { refreshIntegrationStateAfterSave } from '@/lib/postConnectIntegrationRefresh';
import { resolveEnvironmentId } from '@/lib/environment';
import {
  formatIntegrationsLoadError,
  formatIntegrationsRefreshWarning,
} from '@/lib/integrationsDiagnostics';
import {
  databaseConnectionsApi,
  refreshDatabaseHealth,
  type DatabaseConnectionInfo,
  type DatabaseConnectionService,
  type DatabaseConnectionMigrationRunResponse,
  type DatabaseConnectionMigrationStatusResponse,
  type DatabaseConnectionsResponse,
} from '@/lib/api';
import { useAppSelector } from '@/state/hooks';

type ConnectionKey = DatabaseConnectionService;
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'invalid' | 'missing';
type IntegrationsTab = 'databases' | 'api-key';

const parseIntegrationsTab = (value: string | null): IntegrationsTab =>
  value === 'api-key' ? 'api-key' : 'databases';

interface DashboardIntegrationsProps {
  session?: {
    access_token: string;
    environment_id: string;
    environments?: { id: string; type: string }[];
  } | null;
  onMigrationStatusChange?: (status: DatabaseConnectionMigrationStatusResponse) => void;
  onDatabaseHealthChange?: (status: DatabaseConnectionsResponse) => void;
}

interface DatabaseConnection {
  key: ConnectionKey;
  title: string;
  description: string;
  placeholder: string;
  icon: string;
  accentClassName: string;
}

const databaseConnections: DatabaseConnection[] = [
  {
    key: 'accounts',
    title: 'Accounts Database',
    description: 'Manage and view user accounts, balances, and transactional limits.',
    placeholder: 'postgres://user:password@host:port/accounts',
    icon: 'account_balance',
    accentClassName:
      'bg-blue-50 text-blue-600 dark:border dark:border-blue-800/60 dark:bg-blue-950/70 dark:text-blue-200',
  },
  {
    key: 'users',
    title: 'Users Database',
    description: 'Store and manage end-user identities, KYC states, and profile details.',
    placeholder: 'postgres://user:password@host:port/users',
    icon: 'group',
    accentClassName:
      'bg-emerald-50 text-emerald-600 dark:border dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-200',
  },
  {
    key: 'ledger',
    title: 'Ledger Database',
    description: 'Maintains an immutable, double-entry record of all financial transactions.',
    placeholder: 'postgres://user:password@host:port/ledger',
    icon: 'book',
    accentClassName:
      'bg-violet-50 text-violet-600 dark:border dark:border-violet-800/60 dark:bg-violet-950/70 dark:text-violet-200',
  },
  {
    key: 'audit',
    title: 'Audit Services Database',
    description: 'Stores compliance logs, API request traces, and system access history.',
    placeholder: 'postgres://user:password@host:port/audit',
    icon: 'verified_user',
    accentClassName:
      'bg-amber-50 text-amber-700 dark:border dark:border-amber-800/60 dark:bg-amber-950/70 dark:text-amber-200',
  },
];

const initialConnectionValues = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: '' }),
  {} as Record<ConnectionKey, string>
);

const initialVisibility = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: false }),
  {} as Record<ConnectionKey, boolean>
);

const initialStatus = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: 'idle' }),
  {} as Record<ConnectionKey, ConnectionStatus>
);

const initialEditMode = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: false }),
  {} as Record<ConnectionKey, boolean>
);

const initialSetupPhases = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: null }),
  {} as Record<ConnectionKey, DatabaseSetupPhase | null>
);

const initialSetupOutcomes = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: null }),
  {} as Record<ConnectionKey, SetupOutcomeState | null>
);

const initialConnectionNotices = databaseConnections.reduce(
  (values, item) => ({ ...values, [item.key]: null }),
  {} as Record<ConnectionKey, string | null>
);

const statusFromConnection = (connection: DatabaseConnectionInfo | undefined): ConnectionStatus =>
  connectionUiStatusFromApi(connection);

export default function DashboardIntegrations({
  session,
  onMigrationStatusChange,
  onDatabaseHealthChange,
}: DashboardIntegrationsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseIntegrationsTab(searchParams.get('tab'));
  const environment = useAppSelector((state) => state.environment.current);
  const currentEnvironmentId = resolveEnvironmentId(session, environment);
  const isProductionUnavailable = environment === 'production' && !currentEnvironmentId;
  const integrationsErrorContext = useMemo(
    () => ({
      environment,
      environmentId: currentEnvironmentId,
    }),
    [environment, currentEnvironmentId]
  );
  const { state: onboardingState, updateStep } = useOnboarding(currentEnvironmentId);
  const [connections, setConnections] = useState(initialConnectionValues);
  const [showConnections, setShowConnections] = useState(initialVisibility);
  const [isEditingConnection, setIsEditingConnection] = useState(initialEditMode);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const [retryingService, setRetryingService] = useState<ConnectionKey | null>(null);
  const [savedConnectionKeys, setSavedConnectionKeys] = useState<Set<ConnectionKey>>(() => new Set());
  const [migrationStatus, setMigrationStatus] = useState<DatabaseConnectionMigrationStatusResponse | null>(null);
  const [isRunningMigrations, setIsRunningMigrations] = useState(false);
  const [migrationRunResult, setMigrationRunResult] = useState<DatabaseConnectionMigrationRunResponse | null>(null);
  const [setupPhases, setSetupPhases] = useState(initialSetupPhases);
  const [setupOutcomes, setSetupOutcomes] = useState(initialSetupOutcomes);
  const [connectionNotices, setConnectionNotices] = useState(initialConnectionNotices);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const setupInFlightRef = useRef<Set<ConnectionKey>>(new Set());
  const statusRef = useRef(initialStatus);
  const migrationStatusRef = useRef<DatabaseConnectionMigrationStatusResponse | null>(null);
  const fetchGenerationRef = useRef(0);

  // Transient success-footer lifecycle per service.
  // - 'gone'     : not rendered (default; returning users with already-applied
  //                schema do NOT see the footer flash)
  // - 'visible'  : animating in, then holding for ~2.5s
  // - 'exiting'  : animating out, then unmounted
  type TransientSuccessState = 'gone' | 'visible' | 'exiting';
  const [transientSuccess, setTransientSuccess] = useState<Record<ConnectionKey, TransientSuccessState>>(
    () => ({ accounts: 'gone', users: 'gone', ledger: 'gone', audit: 'gone' })
  );
  const previousMigrationToneRef = useRef<Record<ConnectionKey, string | undefined>>({
    accounts: undefined,
    users: undefined,
    ledger: undefined,
    audit: undefined,
  });
  const transientSuccessTimersRef = useRef<Record<ConnectionKey, { hold?: number; exit?: number }>>({
    accounts: {},
    users: {},
    ledger: {},
    audit: {},
  });

  useEffect(() => {
    const timers = transientSuccessTimersRef.current;
    return () => {
      (Object.keys(timers) as ConnectionKey[]).forEach((key) => {
        if (timers[key].hold) window.clearTimeout(timers[key].hold);
        if (timers[key].exit) window.clearTimeout(timers[key].exit);
      });
    };
  }, []);

  const startTransientSuccess = (key: ConnectionKey) => {
    const timers = transientSuccessTimersRef.current[key];
    if (timers.hold) window.clearTimeout(timers.hold);
    if (timers.exit) window.clearTimeout(timers.exit);
    setTransientSuccess((prev) => ({ ...prev, [key]: 'visible' }));
    timers.hold = window.setTimeout(() => {
      setTransientSuccess((prev) => ({ ...prev, [key]: 'exiting' }));
      timers.exit = window.setTimeout(() => {
        setTransientSuccess((prev) => ({ ...prev, [key]: 'gone' }));
      }, 300);
    }, 2500);
  };

  const recomputeOnboarding = (
    summary: DatabaseConnectionsResponse,
    migrations: DatabaseConnectionMigrationStatusResponse
  ) => {
    const action = resolveDbsConnectedOnboardingAction({
      stickyCompleted: readDatabaseSetupCompleted(currentEnvironmentId),
      summary,
      migrations,
    });

    if (action === 'mark-complete') {
      markDatabaseSetupCompleted(currentEnvironmentId);
      updateStep('dbsConnected', true);
      return;
    }
    if (action === 'mark-incomplete' && !readDatabaseSetupCompleted(currentEnvironmentId)) {
      updateStep('dbsConnected', false);
    }
  };

  const publishGlobalHealthIfIdle = () => {
    if (setupInFlightRef.current.size > 0) {
      return;
    }

    const summary = buildConnectionsResponseFromStatuses(
      statusRef.current as Record<ConnectionKey, ConnectionUiStatus>
    );
    const migrations = migrationStatusRef.current;
    onDatabaseHealthChange?.(summary);
    if (migrations) {
      onMigrationStatusChange?.(migrations);
      recomputeOnboarding(summary, migrations);
    }
  };

  const applySetupOutcomeFromSave = (key: ConnectionKey, saved: DatabaseConnectionInfo) => {
    if (saved.status === 'invalid') {
      setSetupOutcomes((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const outcome = setupOutcomeFromSave(saved);
    if (outcome.outcome === 'succeeded') {
      setSetupOutcomes((prev) => ({ ...prev, [key]: null }));
      return;
    }
    if (outcome.outcome === 'failed') {
      setSetupOutcomes((prev) => ({ ...prev, [key]: outcome }));
      return;
    }
    setSetupOutcomes((prev) => ({ ...prev, [key]: null }));
  };

  const applySingleServiceSave = (key: ConnectionKey, saved: DatabaseConnectionInfo) => {
    const nextStatus = statusFromConnection(saved);
    const notice = connectionSetupNotice(saved);
    const serviceMigration = migrationInfoFromSetup(saved);

    statusRef.current = { ...statusRef.current, [key]: nextStatus };
    if (serviceMigration) {
      migrationStatusRef.current = mergeMigrationStatusForService(
         migrationStatusRef.current,
        serviceMigration
      );
    }

    setStatus({ ...statusRef.current });
    setConnectionNotices((prev) => ({ ...prev, [key]: notice }));
    applySetupOutcomeFromSave(key, saved);
    if (saved.status === 'connected' || saved.status === 'invalid') {
      setSavedConnectionKeys((prev) => new Set([...prev, key]));
    }
    if (migrationStatusRef.current) {
      setMigrationStatus(migrationStatusRef.current);
    }
    publishGlobalHealthIfIdle();

    return { nextStatus, notice };
  };

  const applyHealthSnapshot = (
    summary: DatabaseConnectionsResponse,
    migrations: DatabaseConnectionMigrationStatusResponse
  ) => {
    const nextStatus = { ...statusRef.current };
    for (const item of databaseConnections) {
      if (setupInFlightRef.current.has(item.key)) {
        continue;
      }
      nextStatus[item.key] = statusFromConnection(
        summary.connections.find((connection) => connection.service === item.key)
      );
    }

    statusRef.current = nextStatus;
    migrationStatusRef.current = migrations;
    setStatus(nextStatus);
    setSavedConnectionKeys(savedConnectionKeysFromSummary(summary));
    setConnectionNotices((prev) => {
      const next = { ...prev };
      for (const item of databaseConnections) {
        if (!setupInFlightRef.current.has(item.key)) {
          next[item.key] = null;
        }
      }
      return next;
    });
    setMigrationStatus(migrations);
    onDatabaseHealthChange?.(summary);
    onMigrationStatusChange?.(migrations);
    recomputeOnboarding(summary, migrations);
  };

  const beginSetup = (key: ConnectionKey, phase: DatabaseSetupPhase) => {
    setupInFlightRef.current.add(key);
    setSetupPhases((prev) => ({ ...prev, [key]: phase }));
    setSetupOutcomes((prev) => ({ ...prev, [key]: { outcome: 'in_progress' } }));
    statusRef.current = { ...statusRef.current, [key]: 'connecting' };
    setStatus({ ...statusRef.current });
  };

  const advanceSetup = (key: ConnectionKey, phase: DatabaseSetupPhase) => {
    setSetupPhases((prev) => ({ ...prev, [key]: phase }));
  };

  const finishSetup = (key: ConnectionKey, outcome?: SetupOutcomeState | null) => {
    setupInFlightRef.current.delete(key);
    setSetupPhases((prev) => ({ ...prev, [key]: null }));
    if (outcome !== undefined) {
      setSetupOutcomes((prev) => ({ ...prev, [key]: outcome }));
    }
  };

  const finishAllSetup = () => {
    for (const key of [...setupInFlightRef.current]) {
      finishSetup(key);
    }
  };

  const applyListSnapshot = (listed: DatabaseConnectionsResponse) => {
    const savedKeys = listSavedConnectionServices(listed) as ConnectionKey[];
    const nextStatus = statusesFromListResponse(listed);

    setSavedConnectionKeys(new Set(savedKeys));
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    setInitialCheckComplete(true);
    onDatabaseHealthChange?.(listed);
    if (isDatabaseSetupCompletedFromBackend(listed)) {
      markDatabaseSetupCompleted(currentEnvironmentId);
      updateStep('dbsConnected', true);
    }
  };

  const runBackgroundHealthRefresh = async (
    listed: DatabaseConnectionsResponse,
    isStillActive?: () => boolean
  ) => {
    if (!session || !currentEnvironmentId) return;

    const savedKeys = listSavedConnectionServices(listed);
    try {
      if (savedKeys.length === 0) {
        const migrations = await databaseConnectionsApi.migrations(session);
        if (isStillActive && !isStillActive()) return;
        setRefreshWarning(null);
        applyHealthSnapshot(listed, migrations);
        return;
      }

      const { summary, migrations } = await refreshDatabaseHealth(session);
      if (isStillActive && !isStillActive()) return;
      setRefreshWarning(null);
      applyHealthSnapshot(summary, migrations);
    } catch (err) {
      if (isStillActive && !isStillActive()) return;
      setRefreshWarning(
        formatIntegrationsRefreshWarning(err, {
          ...integrationsErrorContext,
          operation: savedKeys.length === 0 ? 'migrations' : 'validate',
        })
      );
    }
  };

  const handleChange = (key: ConnectionKey, value: string) => {
    setConnections((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async (value: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
  };

  const resolveRetryCardState = (
    key: ConnectionKey,
    persistedOutcome: SetupOutcomeState | null
  ): RetryCardState => {
    const connectionStatus = statusRef.current[key];
    const migrationInfo = migrationStatusRef.current?.services.find(
      (service) => service.service === key
    );
    if (
      connectionStatus === 'connected' &&
      (persistedOutcome?.outcome === 'failed' || migrationInfo?.latest_status === 'failed')
    ) {
      return 'setup_failed';
    }
    if (
      connectionStatus === 'connected' &&
      (migrationInfo?.pending_count ?? 0) > 0
    ) {
      return 'pending_migrations';
    }
    return 'invalid';
  };

  const runConnectionSetupFlow = async (
    key: ConnectionKey,
    startPhase: DatabaseSetupPhase,
    run: (
      advance: (phase: DatabaseSetupPhase) => Promise<void>
    ) => Promise<SetupOutcomeState | null | undefined>
  ): Promise<SetupOutcomeState | null | undefined> => {
    beginSetup(key, startPhase);
    await waitForSetupPhaseVisible(startPhase);
    const advance = async (phase: DatabaseSetupPhase) => {
      advanceSetup(key, phase);
      await waitForSetupPhaseVisible(phase);
    };

    try {
      const outcome = await run(advance);
      if (outcome === undefined) {
        finishSetup(key);
      } else {
        finishSetup(key, outcome);
      }
      return outcome ?? null;
    } catch (err) {
      finishSetup(key);
      throw err;
    }
  };

  const handleConnect = async (key: ConnectionKey) => {
    if (!session) {
      setError('Missing session. Please log in again.');
      return;
    }

    const nextConnectionString = connections[key].trim();
    if (!nextConnectionString) {
      setError('Paste a PostgreSQL connection string before connecting.');
      return;
    }

    if (!isPostgresConnectionString(nextConnectionString)) {
      setError('Enter a valid postgres:// or postgresql:// connection string.');
      return;
    }

    const wasConnected = statusRef.current[key] === 'connected';
    setError(null);
    setSetupOutcomes((prev) => ({ ...prev, [key]: null }));

    try {
      let saved: DatabaseConnectionInfo;

      if (wasConnected) {
        saved = await databaseConnectionsApi.save(session, key, nextConnectionString);
        if (isUnchangedSaveResponse(saved)) {
          setConnectionNotices((prev) => ({ ...prev, [key]: unchangedConnectionNotice() }));
          setConnections((prev) => ({ ...prev, [key]: '' }));
          setShowConnections((prev) => ({ ...prev, [key]: false }));
          setIsEditingConnection((prev) => ({ ...prev, [key]: false }));
          return;
        }
        await runConnectionSetupFlow(key, 'validating', async (advance) => {
          await advance('connecting');
          await advance('setting_up');
          return null;
        });
      } else {
        await runConnectionSetupFlow(key, 'validating', async (advance) => {
          await advance('connecting');
          saved = await databaseConnectionsApi.save(session, key, nextConnectionString);
          await advance('setting_up');
          return null;
        });
      }

      const { nextStatus, notice } = applySingleServiceSave(key, saved);

      if (nextStatus === 'connected') {
        setError(null);
      } else {
        setError(notice ?? 'Rails could not open a working database pool for this connection string.');
      }

      try {
        await refreshIntegrationStateAfterSave(session, saved, {
          statusRef,
          migrationStatusRef,
          setMigrationStatus,
          onMigrationStatusChange,
          onDatabaseHealthChange,
          recomputeOnboarding,
          applyListSnapshot,
        });
      } catch {
        // Post-connect milestone refresh is best-effort; card state already reflects the save.
      }

      setConnections((prev) => ({ ...prev, [key]: '' }));
      setShowConnections((prev) => ({ ...prev, [key]: false }));
      setIsEditingConnection((prev) => ({ ...prev, [key]: false }));
    } catch (err) {
      finishSetup(key);
      statusRef.current = { ...statusRef.current, [key]: wasConnected ? 'connected' : 'idle' };
      setStatus({ ...statusRef.current });
      publishGlobalHealthIfIdle();
      setError(err instanceof Error ? err.message : 'Failed to save database connection.');
    }
  };

  const handleEditConnection = (key: ConnectionKey) => {
    setError(null);
    setConnections((prev) => ({ ...prev, [key]: '' }));
    setShowConnections((prev) => ({ ...prev, [key]: false }));
    setIsEditingConnection((prev) => ({ ...prev, [key]: true }));
  };

  const handleCancelEditConnection = (key: ConnectionKey) => {
    setError(null);
    setConnections((prev) => ({ ...prev, [key]: '' }));
    setShowConnections((prev) => ({ ...prev, [key]: false }));
    setIsEditingConnection((prev) => ({ ...prev, [key]: false }));
  };

  const handleRetryConnection = async (key: ConnectionKey) => {
    if (!session) {
      setError('Missing session. Please log in again.');
      return;
    }

    if (computeInteractionsLocked(isRunningMigrations) || setupInFlightRef.current.size > 0) {
      return;
    }

    setRetryingService(key);
    setError(null);

    const cardState = resolveRetryCardState(key, setupOutcomes[key]);
    const startPhase = resolveRetryStartPhase(cardState);
    setSetupOutcomes((prev) => ({ ...prev, [key]: null }));
    setConnectionNotices((prev) => ({ ...prev, [key]: null }));

    try {
      if (cardState === 'setup_failed' || cardState === 'pending_migrations') {
        let setupFailureNotice: string | null = null;
        const outcome = await runConnectionSetupFlow(key, startPhase, async () => {
          const result = await databaseConnectionsApi.runMigrations(session);
          const serviceResult = result.services.find((entry) => entry.service === key);
          if (!serviceResult) {
            return { outcome: 'failed', failedPhase: 'setting_up' };
          }

          migrationStatusRef.current = mergeMigrationRunForService(
            migrationStatusRef.current,
            serviceResult
          );
          setMigrationStatus(migrationStatusRef.current);
          onMigrationStatusChange?.(migrationStatusRef.current);

          if (serviceResult.status === 'failed') {
            setupFailureNotice =
              serviceResult.error ??
              'Your database connection is active, but required schema setup could not finish.';
            setConnectionNotices((prev) => ({
              ...prev,
              [key]: setupFailureNotice,
            }));
            return { outcome: 'failed', failedPhase: 'setting_up' };
          }

          setSetupOutcomes((prev) => ({ ...prev, [key]: null }));
          const summary = buildConnectionsResponseFromStatuses(
            statusRef.current as Record<ConnectionKey, ConnectionUiStatus>
          );
          publishGlobalHealthIfIdle();
          if (migrationStatusRef.current) {
            recomputeOnboarding(summary, migrationStatusRef.current);
          }
          return null;
        });

        if (outcome?.outcome === 'failed') {
          setError(
            setupFailureNotice ??
              'Schema setup could not finish. Check database permissions and try again.'
          );
        }
        return;
      }

      let poolFailureNotice: string | null = null;
      let setupFailureNotice: string | null = null;
      const outcome = await runConnectionSetupFlow(key, startPhase, async (advance) => {
        await advance('connecting');
        const summary = await databaseConnectionsApi.validate(session);
        const connection = summary.connections.find((entry) => entry.service === key);

        statusRef.current = mergeConnectionStatusForService(
          statusRef.current as Record<ConnectionKey, ConnectionUiStatus>,
          key,
          connection
        );
        setStatus({ ...statusRef.current });
        setSavedConnectionKeys((prev) => {
          const next = new Set(prev);
          if (connection?.status === 'connected' || connection?.status === 'invalid') {
            next.add(key);
          }
          return next;
        });

        if (!connection || connection.status === 'invalid') {
          poolFailureNotice = connection
            ? connectionSetupNotice(connection)
            : 'Rails could not open a working database pool for this connection string.';
          setConnectionNotices((prev) => ({ ...prev, [key]: poolFailureNotice }));
          return { outcome: 'failed', failedPhase: 'connecting' };
        }

        await advance('setting_up');
        const migrationResult = await databaseConnectionsApi.runMigrations(session);
        const serviceResult = migrationResult.services.find((entry) => entry.service === key);
        if (!serviceResult) {
          return { outcome: 'failed', failedPhase: 'setting_up' };
        }

        migrationStatusRef.current = mergeMigrationRunForService(
          migrationStatusRef.current,
          serviceResult
        );
        setMigrationStatus(migrationStatusRef.current);
        onMigrationStatusChange?.(migrationStatusRef.current);

        if (serviceResult.status === 'failed') {
          statusRef.current = { ...statusRef.current, [key]: 'connected' };
          setStatus({ ...statusRef.current });
          setupFailureNotice =
            serviceResult.error ??
            'Your database connection is active, but required schema setup could not finish.';
          setConnectionNotices((prev) => ({
            ...prev,
            [key]: setupFailureNotice,
          }));
          return { outcome: 'failed', failedPhase: 'setting_up' };
        }

        statusRef.current = { ...statusRef.current, [key]: 'connected' };
        setStatus({ ...statusRef.current });
        setSetupOutcomes((prev) => ({ ...prev, [key]: null }));
        publishGlobalHealthIfIdle();
        return null;
      });

      if (outcome?.outcome === 'failed' && outcome.failedPhase === 'connecting') {
        setError(
          poolFailureNotice ??
            'Rails could not open a working database pool for this connection string.'
        );
      } else if (outcome?.outcome === 'failed') {
        setError(
          setupFailureNotice ??
            'Schema setup could not finish. Check database permissions and try again.'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry database connection.');
      publishGlobalHealthIfIdle();
    } finally {
      setRetryingService(null);
    }
  };

  const handleRunMigrations = async () => {
    if (!session) {
      setError('Missing session. Please log in again.');
      return;
    }

    setError(null);
    setMigrationRunResult(null);
    setIsRunningMigrations(true);
    try {
      const result = await databaseConnectionsApi.runMigrations(session);
      setMigrationRunResult(result);
      const { summary, migrations } = await refreshDatabaseHealth(session);
      applyHealthSnapshot(summary, migrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run database migrations.');
    } finally {
      setIsRunningMigrations(false);
    }
  };

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    const generation = fetchGenerationRef.current + 1;
    fetchGenerationRef.current = generation;
    const isCurrent = () => fetchGenerationRef.current === generation;

    setSavedConnectionKeys(new Set());
    setSetupPhases(initialSetupPhases);
    setSetupOutcomes(initialSetupOutcomes);
    setInitialCheckComplete(false);
    setError(null);
    setRefreshWarning(null);
    statusRef.current = initialStatus;
    setStatus(initialStatus);
    setMigrationStatus(null);
    migrationStatusRef.current = null;
    setMigrationRunResult(null);

    if (!currentEnvironmentId) {
      finishAllSetup();
      setInitialCheckComplete(true);
      return () => {
        fetchGenerationRef.current += 1;
      };
    }

    void (async () => {
      try {
        const listed = await databaseConnectionsApi.list(session);
        if (!isCurrent()) return;

        applyListSnapshot(listed);
        void runBackgroundHealthRefresh(listed, isCurrent);
      } catch (err) {
        if (!isCurrent()) return;
        finishAllSetup();
        setError(
          formatIntegrationsLoadError(err, {
            ...integrationsErrorContext,
            operation: 'list',
          })
        );
        setInitialCheckComplete(true);
      }
    })();

    return () => {
      fetchGenerationRef.current += 1;
      finishAllSetup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, session?.environments, environment, currentEnvironmentId]);

  const pendingMigrationCount =
    migrationStatus?.services.reduce((total, service) => total + service.pending_count + service.failed_count, 0) ?? 0;
  const appliedMigrationCount =
    migrationRunResult?.services.reduce((total, service) => total + service.applied_count, 0) ?? 0;
  const interactionsLocked =
    isProductionUnavailable || computeInteractionsLocked(isRunningMigrations);

  const selectTab = useCallback(
    (tab: IntegrationsTab) => {
      const path =
        tab === 'api-key' ? '/dashboard/integrations?tab=api-key' : '/dashboard/integrations';
      router.replace(path, { scroll: false });
    },
    [router]
  );

  const canCreateApiKey =
    onboardingState.dbsConnected && isMigrationStatusCurrent(migrationStatus);
  const apiKeyBlockedReason = !onboardingState.dbsConnected
    ? 'Connect all required database integrations before creating an API key.'
    : !isMigrationStatusCurrent(migrationStatus)
      ? 'Apply database updates before creating an API key.'
      : 'Complete setup before creating an API key.';
  const apiKeyBlockedBanner = !canCreateApiKey
    ? !onboardingState.dbsConnected
      ? {
          title: 'Database setup required',
          body: 'API key creation is disabled until every required database is connected for this environment. Connect Accounts, Users, Ledger, and Audit on the Databases tab, then return here to issue a key.',
        }
      : !isMigrationStatusCurrent(migrationStatus)
        ? {
            title: 'Database updates required',
            body: 'API key creation is disabled while schema updates are pending. Apply the available updates on the Databases tab, then return here to create a key.',
          }
        : {
            title: 'Setup incomplete',
            body: 'API key creation is disabled until database setup is complete for this environment.',
          }
    : null;

  const handleActiveKeyChange = useCallback(
    (hasActiveKey: boolean) => updateStep('apiKeyGenerated', hasActiveKey),
    [updateStep]
  );

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div
        role="tablist"
        aria-label="Integrations sections"
        className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800"
      >
        <button
          type="button"
          role="tab"
          id="integrations-tab-databases"
          aria-selected={activeTab === 'databases'}
          aria-controls="integrations-panel-databases"
          data-testid="integrations-tab-databases"
          onClick={() => selectTab('databases')}
          className={`-mb-px border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'databases'
              ? 'border-black text-black dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Databases
        </button>
        <button
          type="button"
          role="tab"
          id="integrations-tab-api-key"
          aria-selected={activeTab === 'api-key'}
          aria-controls="integrations-panel-api-key"
          data-testid="integrations-tab-api-key"
          onClick={() => selectTab('api-key')}
          className={`-mb-px border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'api-key'
              ? 'border-black text-black dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          API Key
        </button>
      </div>

      {activeTab === 'databases' ? (
        <>
      <section id="integrations-panel-databases" role="tabpanel" aria-labelledby="integrations-tab-databases">
        <div className="mb-2">
          <h2 className="text-2xl font-medium tracking-tight text-black dark:text-white">Database Connections</h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          You own your data. Connect to a PostgreSQL provider of your choice to store your core banking data
          securely on your own infrastructure. We recommend{' '}
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-900 underline decoration-dotted decoration-zinc-300 underline-offset-2 transition-colors hover:text-black hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:text-white dark:hover:decoration-zinc-500"
          >
            Neon
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          for its seamless serverless
          architecture and branching capabilities.
        </p>
        <div className="mt-6 flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <span className="material-symbols-sharp mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden>
            security
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Encrypted Storage</h3>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-400/90">
              Connection strings are encrypted before they are stored and decrypted only when Rails validates or
              migrates your service databases.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {isProductionUnavailable ? (
          <div
            className="border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
            data-testid="integrations-production-unavailable"
          >
            Production is not provisioned for this business yet. Switch to Sandbox to configure database
            connections.
          </div>
        ) : null}
        {error ? (
          <div
            className="border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
            data-testid="integrations-page-error"
          >
            {error}
          </div>
        ) : null}
        {refreshWarning ? (
          <div
            className="border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
            data-testid="integrations-refresh-warning"
          >
            {refreshWarning}
          </div>
        ) : null}
        {hasAllMigrationTargets(migrationStatus) && migrationStatus?.has_pending_updates ? (
          <div className="border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="flex flex-col gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="material-symbols-sharp mt-0.5 shrink-0 text-amber-700 dark:text-amber-300 !text-[18px] leading-none" aria-hidden>
                  database
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-950 dark:text-amber-100">
                    Database updates available
                  </p>
                  <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                    {pendingMigrationCount === 1
                      ? '1 database schema update is ready to apply.'
                      : `${pendingMigrationCount} database schema updates are ready to apply.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunMigrations}
                disabled={interactionsLocked}
                className="inline-flex w-full items-center justify-center gap-2 border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-black dark:text-amber-100 dark:hover:bg-amber-950/50"
              >
                {isRunningMigrations ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400/40 border-t-amber-800 dark:border-amber-100/20 dark:border-t-amber-100" />
                ) : (
                  <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    play_arrow
                  </span>
                )}
                Apply updates
              </button>
            </div>
          </div>
        ) : null}
        {migrationRunResult ? (
          <div
            className={`border p-4 text-xs ${
              migrationRunResult.has_failures
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
            }`}
          >
            {migrationRunResult.has_failures
              ? 'Some migrations failed. Review the affected service connection and try again.'
              : appliedMigrationCount === 0
                ? 'All connected service databases are already up to date.'
                : `${appliedMigrationCount} schema update${appliedMigrationCount === 1 ? '' : 's'} applied successfully.`}
          </div>
        ) : null}
        {databaseConnections.map((item) => {
          const value = connections[item.key];
          const connectionStatus = status[item.key];
          const activeSetupPhase = setupPhases[item.key];
          const persistedSetupOutcome = setupOutcomes[item.key];
          const isSettingUp = activeSetupPhase !== null;
          const isAnotherCardSettingUp = Object.entries(setupPhases).some(
            ([serviceKey, phase]) => phase !== null && serviceKey !== item.key
          );
          const isRetryDisabled =
            interactionsLocked || isAnotherCardSettingUp || retryingService !== null;
          const hasSavedConnection = savedConnectionKeys.has(item.key);
          const migrationInfo = migrationStatus?.services.find((service) => service.service === item.key);
          const isSetupFailed =
            connectionStatus === 'connected' &&
            (persistedSetupOutcome?.outcome === 'failed' ||
              migrationInfo?.latest_status === 'failed');
          const terminalFailedPhase = persistedSetupOutcome?.failedPhase ?? 'setting_up';
          const migrationSnapshotLoaded = migrationStatus !== null;
          const isFullyConnected =
            connectionStatus === 'connected' &&
            initialCheckComplete &&
            !isSettingUp &&
            !isSetupFailed &&
            shouldShowConnectedSummaryCard(connectionStatus, migrationInfo, {
              migrationSnapshotLoaded,
            });
          const isConnectedPool =
            connectionStatus === 'connected' && initialCheckComplete && !isSettingUp;
          const isConnecting = connectionStatus === 'connecting' || isSettingUp;
          const isInvalid = connectionStatus === 'invalid' && initialCheckComplete && !isSettingUp;
          const isMissing =
            !hasSavedConnection &&
            !isSettingUp &&
            (connectionStatus === 'missing' || connectionStatus === 'idle');
          const isEditing = (isEditingConnection[item.key] || isMissing) && !isSettingUp;
          const isCardStateReady = computeIsCardStateReady(isSettingUp, initialCheckComplete);
          const connectLabel = isConnectedPool ? 'Save replacement' : 'Connect';
          const serviceNotice = connectionNotices[item.key];
          const migrationTone: MigrationAlertTone =
            !isConnectedPool || migrationInfo?.latest_status === 'not_connected'
              ? 'neutral'
              : migrationInfo?.failed_count || isSetupFailed
                ? 'danger'
                : migrationInfo?.pending_count
                  ? 'warning'
                  : migrationInfo?.latest_status === 'applied'
                    ? 'success'
                    : 'neutral';
          const effectiveMigrationTone: MigrationAlertTone =
            serviceNotice === unchangedConnectionNotice() ? 'warning' : migrationTone;
          const migrationCopy = isSettingUp
            ? 'Schema setup runs after the connection pool is ready.'
            : serviceNotice && (isFullyConnected || isSetupFailed)
              ? serviceNotice
              : !isFullyConnected && !isSetupFailed && connectionStatus !== 'connected'
                ? 'Migrations will be checked after this database is connected.'
                : migrationInfo?.failed_count
                  ? 'A schema migration failed. Use Apply updates to retry, or check your database logs.'
                  : migrationInfo?.pending_count
                    ? `${migrationInfo.pending_count} schema update${migrationInfo.pending_count === 1 ? '' : 's'} available for this database. Apply updates before creating API keys.`
                    : migrationInfo?.latest_status === 'applied'
                      ? 'Schema migrations are applied for this database.'
                      : 'Rails is checking the schema state for this database.';
          const migrationClassName =
            effectiveMigrationTone === 'danger'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
              : effectiveMigrationTone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200'
                : effectiveMigrationTone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400';

          const previousTone = previousMigrationToneRef.current[item.key];
          if (previousTone !== effectiveMigrationTone) {
            previousMigrationToneRef.current[item.key] = effectiveMigrationTone;
            // Only flash success when transitioning INTO it from another tone
            // we've already observed (e.g. warning -> success after Apply
            // updates). Skip the flash on the very first observation so
            // returning users don't see a redundant pulse on every page load.
            if (
              effectiveMigrationTone === 'success' &&
              previousTone !== undefined &&
              previousTone !== 'success'
            ) {
              startTransientSuccess(item.key);
            }
          }
          const transientState = transientSuccess[item.key];
          const shouldRenderMigrationFooter =
            effectiveMigrationTone === 'danger' || effectiveMigrationTone === 'warning';
          const isTransientExiting =
            effectiveMigrationTone === 'success' && transientState === 'exiting';
          const migrationAlertIcon = resolveMigrationAlertIcon(effectiveMigrationTone);
          const migrationFooterIsAlert =
            effectiveMigrationTone === 'danger' || effectiveMigrationTone === 'warning';

          return (
            <section
              key={item.key}
              className="border border-zinc-200 bg-white p-6 transition-colors dark:border-zinc-800 dark:bg-[#050505]"
            >
              <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start lg:gap-6">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                    <div className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                        database
                      </span>
                    </div>
                    <div
                      className={`absolute bottom-0 left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#050505] ${item.accentClassName}`}
                    >
                      <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                        {item.icon}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-semibold text-black dark:text-white">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 self-start rounded-full border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 lg:self-center">
                  PostgreSQL
                </span>
              </div>

              {!isCardStateReady ? (
                <DatabaseConnectionCardSkeleton
                  testId={`database-connection-skeleton-${item.key}`}
                />
              ) : (
                <>
                  {isSettingUp ? (
                    <DatabaseConnectionSetupProgress phase={activeSetupPhase!} title={item.title} />
                  ) : isSetupFailed ? (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                      <div className="min-w-0 flex-1">
                        <DatabaseConnectionSetupProgress
                          phase={terminalFailedPhase}
                          outcome="failed"
                          failedPhase={terminalFailedPhase}
                          title={item.title}
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRetryConnection(item.key)}
                          disabled={isRetryDisabled}
                          className="inline-flex w-full items-center justify-center gap-2 border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[7.5rem] dark:border-red-800 dark:bg-black dark:text-red-200 dark:hover:bg-red-950/50"
                        >
                          <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                            refresh
                          </span>
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditConnection(item.key)}
                          disabled={interactionsLocked}
                          className="inline-flex w-full items-center justify-center gap-2 border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 lg:w-auto lg:min-w-[7.5rem] dark:border-red-800 dark:bg-black dark:text-red-200 dark:hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Edit ${item.title} connection string`}
                        >
                          <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                            edit
                          </span>
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : isInvalid && !isEditing ? (
                    <div className="flex flex-col gap-4 border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="material-symbols-sharp shrink-0 text-red-600 dark:text-red-400 !text-[20px] leading-none" aria-hidden>
                          error
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Needs attention</p>
                          <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-200">
                            The saved encrypted connection did not validate. Retry after the provider recovers, or replace
                            the connection string.
                          </p>
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRetryConnection(item.key)}
                          disabled={isRetryDisabled}
                          className="inline-flex w-full items-center justify-center gap-2 border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[7.5rem] dark:border-red-800 dark:bg-black dark:text-red-200 dark:hover:bg-red-950/50"
                        >
                          <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                            refresh
                          </span>
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditConnection(item.key)}
                          disabled={interactionsLocked}
                          className="inline-flex w-full items-center justify-center gap-2 border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 lg:w-auto lg:min-w-[7.5rem] dark:border-red-800 dark:bg-black dark:text-red-200 dark:hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Edit ${item.title} connection string`}
                        >
                          <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                            edit
                          </span>
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    <div>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3">
                        <div className="relative min-w-0 flex-1">
                          <input
                            type={showConnections[item.key] ? 'text' : 'password'}
                            name={item.key}
                            value={value}
                            onChange={(event) => handleChange(item.key, event.target.value)}
                            placeholder={isConnectedPool ? 'Paste a replacement PostgreSQL connection string' : item.placeholder}
                            aria-label={`${item.title} connection string`}
                            className="w-full border border-zinc-200 bg-zinc-50 py-2.5 pl-4 pr-20 font-mono text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-[#0a0a0a] dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
                            <button
                              type="button"
                              onClick={() => setShowConnections((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                              aria-label={showConnections[item.key] ? `Hide ${item.title} connection string` : `Show ${item.title} connection string`}
                            >
                              <span className="material-symbols-sharp !text-[18px] leading-none" aria-hidden>
                                {showConnections[item.key] ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(value)}
                              disabled={!value}
                              className="text-zinc-400 transition-colors hover:text-zinc-600 disabled:opacity-50 dark:hover:text-zinc-300"
                              aria-label={`Copy ${item.title} connection string`}
                            >
                              <span className="material-symbols-sharp !text-[18px] leading-none" aria-hidden>
                                content_copy
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConnect(item.key)}
                            disabled={interactionsLocked || !value.trim() || isConnecting}
                            className="inline-flex w-full items-center justify-center gap-2 bg-black px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:min-w-[7.5rem] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                          >
                            {connectLabel}
                          </button>
                          {isConnectedPool ? (
                            <button
                              type="button"
                              onClick={() => handleCancelEditConnection(item.key)}
                              disabled={interactionsLocked || isConnecting}
                              className="inline-flex w-full items-center justify-center border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:min-w-[7.5rem] dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {isConnectedPool ? (
                        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          The current encrypted connection remains active until this replacement validates successfully.
                        </p>
                      ) : null}
                    </div>
                  ) : isFullyConnected ? (
                    <div className="flex flex-col gap-4 border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="material-symbols-sharp shrink-0 text-emerald-600 dark:text-emerald-400 !text-[20px] leading-none" aria-hidden>
                          check_circle
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Connected</p>
                          <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-400/90">
                            The connection string is encrypted and hidden. Replace it only when you need to rotate or update
                            database access.
                          </p>
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditConnection(item.key)}
                          disabled={interactionsLocked}
                          className="inline-flex w-full items-center justify-center gap-2 border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 lg:w-auto lg:min-w-[7.5rem] dark:border-emerald-800 dark:bg-black dark:text-emerald-100 dark:hover:bg-emerald-950/50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Edit ${item.title} connection string`}
                        >
                          <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                            edit
                          </span>
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {shouldRenderMigrationFooter ? (
                    <div
                      role={migrationFooterIsAlert ? 'alert' : undefined}
                      className={`mt-4 border p-3 text-xs leading-relaxed ${migrationClassName}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-sharp mt-0.5 !text-[16px] leading-none" aria-hidden>
                          {migrationAlertIcon}
                        </span>
                        <p>{migrationCopy}</p>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          );
        })}
      </div>
        </>
      ) : (
        <div
          id="integrations-panel-api-key"
          role="tabpanel"
          aria-labelledby="integrations-tab-api-key"
          className="space-y-6"
        >
          {apiKeyBlockedBanner ? (
            <div
              role="status"
              data-testid="api-key-creation-blocked-banner"
              className="flex flex-col gap-4 border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="material-symbols-sharp mt-0.5 shrink-0 text-amber-700 dark:text-amber-300 !text-[18px] leading-none"
                  aria-hidden
                >
                  info
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-950 dark:text-amber-100">
                    {apiKeyBlockedBanner.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                    {apiKeyBlockedBanner.body}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => selectTab('databases')}
                className="inline-flex w-full shrink-0 items-center justify-center border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-black dark:text-amber-100 dark:hover:bg-amber-950/50 sm:w-auto"
              >
                Go to Databases
              </button>
            </div>
          ) : null}
          <ApiKeyManager
            session={session}
            canCreate={canCreateApiKey}
            blockedReason={apiKeyBlockedReason}
            onActiveKeyChange={handleActiveKeyChange}
          />
        </div>
      )}
    </div>
  );
}
