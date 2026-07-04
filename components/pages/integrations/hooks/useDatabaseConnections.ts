'use client';

import { useEffect, useRef, useState } from 'react';
import {
  type DatabaseSetupPhase,
  type ConnectionUiStatus,
  type SetupOutcomeState,
  buildConnectionsResponseFromStatuses,
  buildDuplicateSnapshot,
  computeInteractionsLocked,
  connectionSetupNotice,
  connectionUiStatusFromApi,
  displayNameForService,
  DUPLICATE_CONNECTION_NOTICE,
  findDuplicateService,
  isPostgresConnectionString,
  isUnchangedSaveResponse,
  listSavedConnectionServices,
  mergeConnectionStatusForService,
  mergeMigrationRunForService,
  mergeMigrationStatusForService,
  migrationInfoFromSetup,
  resolveRetryStartPhase,
  savedConnectionKeysFromSummary,
  setupOutcomeFromSave,
  statusesFromListResponse,
  unchangedConnectionNotice,
  waitForSetupPhaseVisible,
} from '@/lib/databaseConnectionSetup';
import {
  databaseConnectionsApi,
  refreshDatabaseHealth,
  type DatabaseConnectionInfo,
  type DatabaseConnectionMigrationRunResponse,
  type DatabaseConnectionMigrationStatusResponse,
  type DatabaseConnectionsResponse,
  type DatabaseConnectionService,
} from '@/lib/api';
import { isApiRequestError } from '@/lib/apiRequestError';
import {
  isDatabaseSetupCompletedFromBackend,
  markDatabaseSetupCompleted,
  readDatabaseSetupCompleted,
  resolveDbsConnectedOnboardingAction,
} from '@/lib/databaseSetupState';
import { isMigrationStatusCurrent } from '@/lib/databaseReadiness';
import { refreshIntegrationStateAfterSave } from '@/lib/postConnectIntegrationRefresh';
import { formatIntegrationsLoadError } from '@/lib/integrationsDiagnostics';
import type { Environment } from '@/state/slices/environmentSlice';

export type ConnectionKey = DatabaseConnectionService;

interface Session {
  access_token: string;
  environment_id: string;
  environments?: { id: string; type: string }[];
}

interface UseDatabaseConnectionsArgs {
  session?: Session | null;
  environment: Environment;
  currentEnvironmentId: string | null;
  serviceKeys: readonly ConnectionKey[];
  isProductionUnavailable: boolean;
  updateOnboardingStep: (step: 'dbsConnected' | 'initialMigrationsApplied', value: boolean) => void;
  onMigrationStatusChange?: (status: DatabaseConnectionMigrationStatusResponse) => void;
  onDatabaseHealthChange?: (status: DatabaseConnectionsResponse) => void;
}

const buildInitial = <T>(keys: readonly ConnectionKey[], value: T): Record<ConnectionKey, T> =>
  keys.reduce((acc, k) => ({ ...acc, [k]: value }), {} as Record<ConnectionKey, T>);

export function useDatabaseConnections({
  session,
  environment,
  currentEnvironmentId,
  serviceKeys,
  isProductionUnavailable,
  updateOnboardingStep,
  onMigrationStatusChange,
  onDatabaseHealthChange,
}: UseDatabaseConnectionsArgs) {
  const initialConnectionValues = buildInitial(serviceKeys, '');
  const initialVisibility = buildInitial(serviceKeys, false);
  const initialEditMode = buildInitial(serviceKeys, false);
  const initialStatus = buildInitial<ConnectionUiStatus>(serviceKeys, 'idle');
  const initialPhases = buildInitial<DatabaseSetupPhase | null>(serviceKeys, null);
  const initialOutcomes = buildInitial<SetupOutcomeState | null>(serviceKeys, null);
  const initialNotices = buildInitial<string | null>(serviceKeys, null);

  const [connections, setConnections] = useState(initialConnectionValues);
  const [showConnections, setShowConnections] = useState(initialVisibility);
  const [isEditingConnection, setIsEditingConnection] = useState(initialEditMode);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [retryingService, setRetryingService] = useState<ConnectionKey | null>(null);
  const [savingService, setSavingService] = useState<ConnectionKey | null>(null);
  const [savedConnectionKeys, setSavedConnectionKeys] = useState<Set<ConnectionKey>>(() => new Set());
  const [migrationStatus, setMigrationStatus] =
    useState<DatabaseConnectionMigrationStatusResponse | null>(null);
  const [isRunningMigrations, setIsRunningMigrations] = useState(false);
  const [migrationRunResult, setMigrationRunResult] =
    useState<DatabaseConnectionMigrationRunResponse | null>(null);
  const [setupPhases, setSetupPhases] = useState(initialPhases);
  const [setupOutcomes, setSetupOutcomes] = useState(initialOutcomes);
  const [connectionNotices, setConnectionNotices] = useState(initialNotices);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const setupInFlightRef = useRef<Set<ConnectionKey>>(new Set());
  const statusRef = useRef(initialStatus);
  const migrationStatusRef = useRef<DatabaseConnectionMigrationStatusResponse | null>(null);
  const fetchGenerationRef = useRef(0);

  const interactionsLocked =
    isProductionUnavailable || computeInteractionsLocked(isRunningMigrations);

  const recomputeOnboarding = (
    summary: DatabaseConnectionsResponse,
    migrations: DatabaseConnectionMigrationStatusResponse
  ) => {
    const initialMigrationsApplied =
      readDatabaseSetupCompleted(currentEnvironmentId) || isMigrationStatusCurrent(migrations);
    updateOnboardingStep('initialMigrationsApplied', initialMigrationsApplied);

    const action = resolveDbsConnectedOnboardingAction({
      stickyCompleted: readDatabaseSetupCompleted(currentEnvironmentId),
      summary,
      migrations,
    });
    if (action === 'mark-complete') {
      markDatabaseSetupCompleted(currentEnvironmentId);
      updateOnboardingStep('dbsConnected', true);
      return;
    }
    if (action === 'mark-incomplete' && !readDatabaseSetupCompleted(currentEnvironmentId)) {
      updateOnboardingStep('dbsConnected', false);
    }
  };

  const publishGlobalHealthIfIdle = () => {
    if (setupInFlightRef.current.size > 0) return;
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

  const beginSetup = (key: ConnectionKey, phase: DatabaseSetupPhase) => {
    setupInFlightRef.current.add(key);
    setSetupPhases((p) => ({ ...p, [key]: phase }));
    setSetupOutcomes((p) => ({ ...p, [key]: { outcome: 'in_progress' } }));
    statusRef.current = { ...statusRef.current, [key]: 'connecting' };
    setStatus({ ...statusRef.current });
  };

  const advanceSetup = (key: ConnectionKey, phase: DatabaseSetupPhase) =>
    setSetupPhases((p) => ({ ...p, [key]: phase }));

  const finishSetup = (key: ConnectionKey, outcome?: SetupOutcomeState | null) => {
    setupInFlightRef.current.delete(key);
    setSetupPhases((p) => ({ ...p, [key]: null }));
    if (outcome !== undefined) setSetupOutcomes((p) => ({ ...p, [key]: outcome }));
  };

  const finishAllSetup = () => {
    for (const key of [...setupInFlightRef.current]) finishSetup(key);
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
      finishSetup(key, outcome === undefined ? undefined : outcome);
      return outcome ?? null;
    } catch (err) {
      finishSetup(key);
      throw err;
    }
  };

  const applySetupOutcomeFromSave = (key: ConnectionKey, saved: DatabaseConnectionInfo) => {
    if (saved.status === 'invalid') {
      setSetupOutcomes((p) => ({ ...p, [key]: null }));
      return;
    }
    const outcome = setupOutcomeFromSave(saved);
    setSetupOutcomes((p) => ({ ...p, [key]: outcome.outcome === 'failed' ? outcome : null }));
  };

  const applySingleServiceSave = (key: ConnectionKey, saved: DatabaseConnectionInfo) => {
    const nextStatus = connectionUiStatusFromApi(saved);
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
    setConnectionNotices((p) => ({ ...p, [key]: notice }));
    applySetupOutcomeFromSave(key, saved);
    if (saved.status === 'connected' || saved.status === 'invalid') {
      setSavedConnectionKeys((p) => new Set([...p, key]));
    }
    if (migrationStatusRef.current) setMigrationStatus(migrationStatusRef.current);
    publishGlobalHealthIfIdle();

    return { nextStatus, notice };
  };

  const applyHealthSnapshot = (
    summary: DatabaseConnectionsResponse,
    migrations: DatabaseConnectionMigrationStatusResponse
  ) => {
    const nextStatus = { ...statusRef.current };
    for (const key of serviceKeys) {
      if (setupInFlightRef.current.has(key)) continue;
      nextStatus[key] = connectionUiStatusFromApi(
        summary.connections.find((c) => c.service === key)
      );
    }
    statusRef.current = nextStatus;
    migrationStatusRef.current = migrations;
    setStatus(nextStatus);
    setSavedConnectionKeys(savedConnectionKeysFromSummary(summary));
    setConnectionNotices((prev) => {
      const next = { ...prev };
      for (const key of serviceKeys) {
        if (!setupInFlightRef.current.has(key)) next[key] = null;
      }
      return next;
    });
    setMigrationStatus(migrations);
    onDatabaseHealthChange?.(summary);
    onMigrationStatusChange?.(migrations);
    recomputeOnboarding(summary, migrations);
  };

  const applyListSnapshot = (
    listed: DatabaseConnectionsResponse,
    migrations?: DatabaseConnectionMigrationStatusResponse
  ) => {
    const savedKeys = listSavedConnectionServices(listed) as ConnectionKey[];
    const nextStatus = statusesFromListResponse(listed);
    setSavedConnectionKeys(new Set(savedKeys));
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    setInitialCheckComplete(true);
    onDatabaseHealthChange?.(listed);

    const onboardingMigrations = migrations ?? migrationStatusRef.current;
    if (migrations) {
      migrationStatusRef.current = migrations;
      setMigrationStatus(migrations);
      onMigrationStatusChange?.(migrations);
    }
    if (onboardingMigrations) {
      recomputeOnboarding(listed, onboardingMigrations);
      return;
    }
    updateOnboardingStep('initialMigrationsApplied', false);
    if (isDatabaseSetupCompletedFromBackend(listed)) {
      markDatabaseSetupCompleted(currentEnvironmentId);
      updateOnboardingStep('dbsConnected', true);
    }
  };

  const resolveRetryCardState = (key: ConnectionKey, persistedOutcome: SetupOutcomeState | null) => {
    const connectionStatus = statusRef.current[key];
    const migrationInfo = migrationStatusRef.current?.services.find((s) => s.service === key);
    if (
      connectionStatus === 'connected' &&
      (persistedOutcome?.outcome === 'failed' || migrationInfo?.latest_status === 'failed')
    ) {
      return 'setup_failed' as const;
    }
    if (connectionStatus === 'connected' && (migrationInfo?.pending_count ?? 0) > 0) {
      return 'pending_migrations' as const;
    }
    return 'invalid' as const;
  };

  const handleChange = (key: ConnectionKey, value: string) => {
    setConnections((p) => ({ ...p, [key]: value }));
    setConnectionNotices((p) => {
      if (p[key] == null) return p;
      return { ...p, [key]: null };
    });
  };

  const handleCopy = async (value: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
  };

  const handleConnect = async (key: ConnectionKey) => {
    if (!session) {
      setError('Missing session. Please log in again.');
      return;
    }
    const next = connections[key].trim();
    if (!next) {
      setError('Paste a PostgreSQL connection string before connecting.');
      return;
    }
    if (!isPostgresConnectionString(next)) {
      setError('Enter a valid postgres:// or postgresql:// connection string.');
      return;
    }

    // FR-5 client guard: catch same-session duplicates before hitting the network.
    // Cross-session duplicates fall through to the backend 409 (see 409 catch arm).
    const duplicateSnapshot = buildDuplicateSnapshot(connections, serviceKeys);
    const conflictingService = findDuplicateService(duplicateSnapshot, key, next);
    if (conflictingService) {
      setConnectionNotices((prev) => ({
        ...prev,
        [key]: DUPLICATE_CONNECTION_NOTICE(
          displayNameForService(conflictingService),
          displayNameForService(key)
        ),
      }));
      return;
    }

    const wasConnected = statusRef.current[key] === 'connected';
    const generation = fetchGenerationRef.current;
    setError(null);
    setSetupOutcomes((p) => ({ ...p, [key]: null }));
    setSavingService(key);

    const saveConnectionForService = (connectionString: string): Promise<DatabaseConnectionInfo> => {
      switch (key) {
        case 'accounts':
          return databaseConnectionsApi.saveAccountsConnection(session, connectionString);
        case 'users':
          return databaseConnectionsApi.saveUsersConnection(session, connectionString);
        case 'ledger':
          return databaseConnectionsApi.saveLedgerConnection(session, connectionString);
        case 'audit':
          return databaseConnectionsApi.saveAuditConnection(session, connectionString);
        default: {
          const _exhaustive: never = key;
          throw new Error(`Unknown database service key: ${_exhaustive}`);
        }
      }
    };

    try {
      let saved: DatabaseConnectionInfo | undefined;
      if (wasConnected) {
        saved = await saveConnectionForService(next);
        if (isUnchangedSaveResponse(saved)) {
          setConnectionNotices((p) => ({ ...p, [key]: unchangedConnectionNotice() }));
          setConnections((p) => ({ ...p, [key]: '' }));
          setShowConnections((p) => ({ ...p, [key]: false }));
          setIsEditingConnection((p) => ({ ...p, [key]: false }));
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
          saved = await saveConnectionForService(next);
          await advance('setting_up');
          return null;
        });
      }
      if (fetchGenerationRef.current !== generation) return;
      if (!saved) return;

      const { nextStatus, notice } = applySingleServiceSave(key, saved);
      if (nextStatus === 'connected') setError(null);
      else setError(notice ?? 'Rails could not open a working database pool for this connection string.');

      try {
        await refreshIntegrationStateAfterSave(session, saved, {
          statusRef: statusRef as { current: Record<ConnectionKey, ConnectionUiStatus> },
          migrationStatusRef,
          setMigrationStatus,
          onMigrationStatusChange,
          onDatabaseHealthChange,
          recomputeOnboarding,
          applyListSnapshot,
        });
      } catch {
        /* best-effort */
      }
      if (fetchGenerationRef.current !== generation) return;

      setConnections((p) => ({ ...p, [key]: '' }));
      setShowConnections((p) => ({ ...p, [key]: false }));
      setIsEditingConnection((p) => ({ ...p, [key]: false }));
    } catch (err) {
      if (fetchGenerationRef.current !== generation) return;
      finishSetup(key);
      statusRef.current = { ...statusRef.current, [key]: wasConnected ? 'connected' : 'idle' };
      setStatus({ ...statusRef.current });
      publishGlobalHealthIfIdle();
      const fallbackConflictMessage =
        err && typeof err === 'object' && 'status' in err && (err as { status?: unknown }).status === 409
          ? err instanceof Error
            ? err.message
            : null
          : null;
      const conflictMessage =
        isApiRequestError(err) && err.status === 409
          ? err.message
          : fallbackConflictMessage;
      if (conflictMessage) {
        setConnectionNotices((prev) => ({
          ...prev,
          [key]: conflictMessage,
        }));
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save database connection.');
      }
    } finally {
      setSavingService((current) => (current === key ? null : current));
    }
  };

  const handleEditConnection = (key: ConnectionKey) => {
    setError(null);
    setConnections((p) => ({ ...p, [key]: '' }));
    setShowConnections((p) => ({ ...p, [key]: false }));
    setIsEditingConnection((p) => ({ ...p, [key]: true }));
  };

  const handleCancelEdit = (key: ConnectionKey) => {
    setError(null);
    setConnections((p) => ({ ...p, [key]: '' }));
    setShowConnections((p) => ({ ...p, [key]: false }));
    setIsEditingConnection((p) => ({ ...p, [key]: false }));
  };

  const handleRetryConnection = async (key: ConnectionKey) => {
    if (!session) {
      setError('Missing session. Please log in again.');
      return;
    }
    if (interactionsLocked || setupInFlightRef.current.size > 0) return;

    setRetryingService(key);
    setError(null);

    const cardState = resolveRetryCardState(key, setupOutcomes[key]);
    const startPhase = resolveRetryStartPhase(cardState);
    setSetupOutcomes((p) => ({ ...p, [key]: null }));
    setConnectionNotices((p) => ({ ...p, [key]: null }));

    try {
      if (cardState === 'setup_failed' || cardState === 'pending_migrations') {
        let setupFailureNotice: string | null = null;
        const outcome = await runConnectionSetupFlow(key, startPhase, async () => {
          const result = await databaseConnectionsApi.runMigrations(session);
          const sr = result.services.find((e) => e.service === key);
          if (!sr) return { outcome: 'failed', failedPhase: 'setting_up' };
          migrationStatusRef.current = mergeMigrationRunForService(migrationStatusRef.current, sr);
          setMigrationStatus(migrationStatusRef.current);
          onMigrationStatusChange?.(migrationStatusRef.current);
          if (sr.status === 'failed') {
            setupFailureNotice = sr.error ?? 'Schema setup could not finish.';
            setConnectionNotices((p) => ({ ...p, [key]: setupFailureNotice }));
            return { outcome: 'failed', failedPhase: 'setting_up' };
          }
          setSetupOutcomes((p) => ({ ...p, [key]: null }));
          publishGlobalHealthIfIdle();
          return null;
        });
        if (outcome?.outcome === 'failed') {
          setError(setupFailureNotice ?? 'Schema setup could not finish.');
        }
        return;
      }

      let poolFailureNotice: string | null = null;
      let setupFailureNotice: string | null = null;
      const outcome = await runConnectionSetupFlow(key, startPhase, async (advance) => {
        await advance('connecting');
        const summary = await databaseConnectionsApi.validate(session);
        const connection = summary.connections.find((e) => e.service === key);
        statusRef.current = mergeConnectionStatusForService(
          statusRef.current as Record<ConnectionKey, ConnectionUiStatus>,
          key,
          connection
        );
        setStatus({ ...statusRef.current });
        setSavedConnectionKeys((prev) => {
          const nextSet = new Set(prev);
          if (connection?.status === 'connected' || connection?.status === 'invalid') nextSet.add(key);
          return nextSet;
        });

        if (!connection || connection.status === 'invalid') {
          poolFailureNotice = connection
            ? connectionSetupNotice(connection)
            : 'Rails could not open a working database pool for this connection string.';
          setConnectionNotices((p) => ({ ...p, [key]: poolFailureNotice }));
          return { outcome: 'failed', failedPhase: 'connecting' };
        }

        await advance('setting_up');
        const migrationResult = await databaseConnectionsApi.runMigrations(session);
        const sr = migrationResult.services.find((e) => e.service === key);
        if (!sr) return { outcome: 'failed', failedPhase: 'setting_up' };

        migrationStatusRef.current = mergeMigrationRunForService(migrationStatusRef.current, sr);
        setMigrationStatus(migrationStatusRef.current);
        onMigrationStatusChange?.(migrationStatusRef.current);

        if (sr.status === 'failed') {
          statusRef.current = { ...statusRef.current, [key]: 'connected' };
          setStatus({ ...statusRef.current });
          setupFailureNotice = sr.error ?? 'Schema setup could not finish.';
          setConnectionNotices((p) => ({ ...p, [key]: setupFailureNotice }));
          return { outcome: 'failed', failedPhase: 'setting_up' };
        }

        statusRef.current = { ...statusRef.current, [key]: 'connected' };
        setStatus({ ...statusRef.current });
        setSetupOutcomes((p) => ({ ...p, [key]: null }));
        publishGlobalHealthIfIdle();
        return null;
      });

      if (outcome?.outcome === 'failed' && outcome.failedPhase === 'connecting') {
        setError(poolFailureNotice ?? 'Rails could not open a working database pool.');
      } else if (outcome?.outcome === 'failed') {
        setError(setupFailureNotice ?? 'Schema setup could not finish.');
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
    if (!session) return undefined;
    const generation = fetchGenerationRef.current + 1;
    fetchGenerationRef.current = generation;
    const isCurrent = () => fetchGenerationRef.current === generation;

    setSavedConnectionKeys(new Set());
    setSetupPhases(initialPhases);
    setSetupOutcomes(initialOutcomes);
    setInitialCheckComplete(false);
    setError(null);
    setSavingService(null);
    statusRef.current = initialStatus;
    setStatus(initialStatus);
    setMigrationStatus(null);
    migrationStatusRef.current = null;
    setMigrationRunResult(null);
    setConnections(initialConnectionValues);
    setShowConnections(initialVisibility);
    setIsEditingConnection(initialEditMode);
    setConnectionNotices(initialNotices);

    if (!currentEnvironmentId) {
      finishAllSetup();
      setInitialCheckComplete(true);
      return () => {
        fetchGenerationRef.current += 1;
      };
    }

    void (async () => {
      try {
        const [listed, migrations] = await Promise.all([
          databaseConnectionsApi.list(session),
          databaseConnectionsApi.migrations(session),
        ]);
        if (!isCurrent()) return;
        applyListSnapshot(listed, migrations);
      } catch (err) {
        if (!isCurrent()) return;
        finishAllSetup();
        setError(
          formatIntegrationsLoadError(err, {
            environment,
            environmentId: currentEnvironmentId,
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

  return {
    connections,
    showConnections,
    isEditingConnection,
    status,
    error,
    retryingService,
    savingService,
    savedConnectionKeys,
    migrationStatus,
    isRunningMigrations,
    migrationRunResult,
    setupPhases,
    setupOutcomes,
    connectionNotices,
    initialCheckComplete,
    interactionsLocked,
    setShowConnections,
    handleChange,
    handleCopy,
    handleConnect,
    handleEditConnection,
    handleCancelEdit,
    handleRetryConnection,
    handleRunMigrations,
  };
}
