import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingDocsCtaLink } from '@/components/marketing/atoms/MarketingDocsCtaLink';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  isDatabaseSetupCompletedFromBackend,
  markDatabaseSetupCompleted,
  readDatabaseSetupCompleted,
  resolveDbsConnectedOnboardingAction,
} from '@/lib/databaseSetupState';
import { apiKeysApi, databaseConnectionsApi, type DatabaseConnectionMigrationStatusResponse } from '@/lib/api';
import { useAppSelector } from '@/state/hooks';

interface DashboardOverviewV2Props {
  overviewStats?: {
    activeAccounts: number;
    postedEntries: number;
    settledVolume: number;
  };
  isLoadingOverviewStats?: boolean;
  overviewCurrency?: string;
  session?: any;
}

const formatCount = (value: number) => value.toLocaleString('en-US');

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

const OverviewMetricLoader = ({
  valueWidth,
  sublabelWidth,
}: {
  valueWidth: string;
  sublabelWidth: string;
}) => (
  <div className="contents" aria-hidden="true">
    <span
      className="inline-block h-9 animate-pulse bg-zinc-200 align-bottom dark:bg-zinc-800"
      style={{ width: valueWidth }}
    />
    <span
      className="mb-1 inline-block h-3 animate-pulse bg-zinc-200 align-bottom dark:bg-zinc-800"
      style={{ width: sublabelWidth }}
    />
  </div>
);

const DashboardOverviewV2: React.FC<DashboardOverviewV2Props> = ({
  overviewStats = { activeAccounts: 0, postedEntries: 0, settledVolume: 0 },
  isLoadingOverviewStats = false,
  overviewCurrency = 'USD',
  session,
}) => {
  const { state, updateStep, isComplete } = useOnboarding();
  const environment = useAppSelector((reduxState) => reduxState.environment.current);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [migrationSnapshot, setMigrationSnapshot] =
    useState<DatabaseConnectionMigrationStatusResponse | null>(null);

  const environmentId =
    session?.environments?.find((item: { id: string; type: string }) => item.type === environment)?.id ??
    session?.environment_id;

  const backendMilestoneComplete =
    isDatabaseSetupCompletedFromBackend(migrationSnapshot) ||
    readDatabaseSetupCompleted(environmentId);

  const dbsStepVisuallyComplete = backendMilestoneComplete;

  const handleSendTestRequest = () => {
    setIsSendingRequest(true);
    window.setTimeout(() => {
      setIsSendingRequest(false);
      updateStep('firstRequestSent', true);
    }, 1500);
  };

  React.useEffect(() => {
    if (!session) return;
    let isActive = true;

    if (readDatabaseSetupCompleted(environmentId)) {
      updateStep('dbsConnected', true);
    }

    databaseConnectionsApi
      .list(session)
      .then(async (summary) => {
        const setupCompleted = readDatabaseSetupCompleted(environmentId);
        const listAction = resolveDbsConnectedOnboardingAction({
          stickyCompleted: setupCompleted,
          summary,
          migrations: null,
        });
        if (listAction === 'mark-complete') {
          markDatabaseSetupCompleted(environmentId);
        }
        if (isActive && listAction === 'mark-complete') {
          updateStep('dbsConnected', true);
        }

        const migrations = await databaseConnectionsApi.migrations(session);
        const action = resolveDbsConnectedOnboardingAction({
          stickyCompleted: setupCompleted || readDatabaseSetupCompleted(environmentId),
          summary,
          migrations,
        });
        if (action === 'mark-complete') {
          markDatabaseSetupCompleted(environmentId);
        }
        if (isActive) {
          setMigrationSnapshot(migrations);
        }
        if (isActive && action === 'mark-complete') {
          updateStep('dbsConnected', true);
        } else if (isActive && action === 'hold' && readDatabaseSetupCompleted(environmentId)) {
          updateStep('dbsConnected', true);
        } else if (isActive && action === 'mark-incomplete' && !readDatabaseSetupCompleted(environmentId)) {
          updateStep('dbsConnected', false);
        }
      })
      .catch(() => {
        const action = resolveDbsConnectedOnboardingAction({
          stickyCompleted: readDatabaseSetupCompleted(environmentId),
          summary: null,
          migrations: null,
        });
        if (isActive && action === 'mark-incomplete' && !readDatabaseSetupCompleted(environmentId)) {
          updateStep('dbsConnected', false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [session, environment, environmentId, updateStep]);

  React.useEffect(() => {
    if (!session || !environmentId) return;
    let isActive = true;
    apiKeysApi
      .list(session)
      .then((keys) => {
        const hasActiveKey = keys.some(
          (key) =>
            (key.environment_id || '') === (environmentId || '') &&
            (key.status || '').toLowerCase() === 'active'
        );
        if (isActive) updateStep('apiKeyGenerated', hasActiveKey);
      })
      .catch(() => {
        if (isActive) updateStep('apiKeyGenerated', false);
      });
    return () => {
      isActive = false;
    };
  }, [session, environment, environmentId, updateStep]);

  const overviewTiles = [
    {
      label: 'Active Accounts',
      value: formatCount(overviewStats.activeAccounts),
      sublabel: 'accounts',
      loaderValueWidth: '4ch',
      loaderSublabelWidth: '7ch',
    },
    {
      label: 'Completed Transactions',
      value: formatCount(overviewStats.postedEntries),
      sublabel: 'transactions',
      loaderValueWidth: '4ch',
      loaderSublabelWidth: '10ch',
    },
    {
      label: 'Settled Volume',
      value: formatCurrency(overviewStats.settledVolume, overviewCurrency),
      sublabel: 'ledger',
      loaderValueWidth: '9ch',
      loaderSublabelWidth: '5ch',
    },
  ];

  return (
    <div className="space-y-8 w-full" data-testid="dashboard-overview-v2">
      {!state.dismissed && (
        <section className="relative overflow-hidden border border-zinc-200 bg-white p-6 transition-colors dark:border-zinc-800 dark:bg-[#050505] md:p-8">
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                  {isComplete ? (
                    <span className="material-symbols-sharp text-emerald-500 !text-[10px] leading-none" aria-hidden>
                      check
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  )}
                </div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {isComplete ? 'Setup Complete' : 'Setup Required'}
                </span>
              </div>
              {isComplete && (
                <button
                  type="button"
                  onClick={() => updateStep('dismissed', true)}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
                >
                  Dismiss
                </button>
              )}
            </div>

            <h2 className="mb-2 text-2xl font-medium tracking-tight text-black dark:text-white">Welcome to Rails</h2>
            <p className="mb-8 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {isComplete
                ? "You've successfully configured your infrastructure. You're ready to start building."
                : 'Before you can create accounts and process transactions, connect your infrastructure and generate your first API key.'}
            </p>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              <div
                className={`flex h-full flex-col border p-6 transition-colors ${
                  dbsStepVisuallyComplete
                    ? 'border-emerald-200 bg-emerald-50/60 opacity-90 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    : 'border-zinc-200 bg-zinc-50 shadow-sm ring-1 ring-black dark:border-zinc-800 dark:bg-[#0a0a0a] dark:ring-white'
                }`}
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      dbsStepVisuallyComplete ? 'bg-emerald-500 text-white' : 'bg-black text-white dark:bg-white dark:text-black'
                    }`}
                  >
                    {dbsStepVisuallyComplete ? (
                      <span className="material-symbols-sharp !text-[14px] leading-none" aria-hidden>
                        check
                      </span>
                    ) : (
                      '1'
                    )}
                  </div>
                  {!dbsStepVisuallyComplete && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-black dark:bg-zinc-800 dark:text-white">
                      Action required
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">Connect Databases</h3>
                <p className="mb-6 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Provide PostgreSQL connection strings so Rails can work with your own infrastructure.
                </p>
                {dbsStepVisuallyComplete ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-emerald-100 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    Connected
                  </button>
                ) : (
                  <Link
                    href="/dashboard/integrations"
                    className="block w-full bg-black px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Configure Integrations
                  </Link>
                )}
              </div>

              <div
                className={`flex h-full flex-col border p-6 transition-colors ${
                  !state.dbsConnected
                    ? 'border-zinc-200 bg-white opacity-60 dark:border-zinc-800 dark:bg-[#050505]'
                    : state.apiKeyGenerated
                      ? 'border-emerald-200 bg-emerald-50/60 opacity-90 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-zinc-200 bg-zinc-50 shadow-sm ring-1 ring-black dark:border-zinc-800 dark:bg-[#0a0a0a] dark:ring-white'
                }`}
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      !state.dbsConnected
                        ? 'border border-zinc-300 text-zinc-500 dark:border-zinc-700'
                        : state.apiKeyGenerated
                          ? 'bg-emerald-500 text-white'
                          : 'bg-black text-white dark:bg-white dark:text-black'
                    }`}
                  >
                    {state.apiKeyGenerated ? (
                      <span className="material-symbols-sharp !text-[14px] leading-none" aria-hidden>
                        check
                      </span>
                    ) : (
                      '2'
                    )}
                  </div>
                  {state.dbsConnected && !state.apiKeyGenerated && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-black dark:bg-zinc-800 dark:text-white">
                      Action required
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">Generate API Key</h3>
                <p className="mb-6 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Create a secure token to authenticate application requests against the Rails API.
                </p>
                {!state.dbsConnected ? (
                  <button
                    type="button"
                    disabled
                    className="w-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    Locked
                  </button>
                ) : state.apiKeyGenerated ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-emerald-100 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    Key Generated
                  </button>
                ) : (
                  <Link
                    href="/dashboard/integrations?tab=api-key"
                    className="flex w-full items-center justify-center gap-2 bg-black px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Manage API Key
                  </Link>
                )}
              </div>

              <div
                className={`flex h-full flex-col border p-6 transition-colors ${
                  !state.apiKeyGenerated
                    ? 'border-zinc-200 bg-white opacity-60 dark:border-zinc-800 dark:bg-[#050505]'
                    : state.firstRequestSent
                      ? 'border-emerald-200 bg-emerald-50/60 opacity-90 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-zinc-200 bg-zinc-50 shadow-sm ring-1 ring-black dark:border-zinc-800 dark:bg-[#0a0a0a] dark:ring-white'
                }`}
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      !state.apiKeyGenerated
                        ? 'border border-zinc-300 text-zinc-500 dark:border-zinc-700'
                        : state.firstRequestSent
                          ? 'bg-emerald-500 text-white'
                          : 'bg-black text-white dark:bg-white dark:text-black'
                    }`}
                  >
                    {state.firstRequestSent ? (
                      <span className="material-symbols-sharp !text-[14px] leading-none" aria-hidden>
                        check
                      </span>
                    ) : (
                      '3'
                    )}
                  </div>
                  {state.apiKeyGenerated && !state.firstRequestSent && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-black dark:bg-zinc-800 dark:text-white">
                      Action required
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-white">Send First Request</h3>
                <p className="mb-6 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Verify the setup by sending your first test request through the Rails API.
                </p>
                {!state.apiKeyGenerated ? (
                  <button
                    type="button"
                    disabled
                    className="w-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    Locked
                  </button>
                ) : state.firstRequestSent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-emerald-100 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    Verified
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendTestRequest}
                    disabled={isSendingRequest}
                    className="flex w-full items-center justify-center gap-2 bg-black px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    {isSendingRequest && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/20 dark:border-t-black" />
                    )}
                    {isSendingRequest ? 'Sending...' : 'Send Test Request'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {overviewTiles.map((tile) => (
          <div
            key={tile.label}
            data-testid={`dashboard-overview-stat-${tile.label.replace(/\s+/g, '-').toLowerCase()}`}
            className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-mono font-semibold text-zinc-500 tracking-widest uppercase">
                {tile.label}
              </span>
            </div>
            <div
              className="flex items-end justify-between"
              aria-busy={isLoadingOverviewStats}
              aria-label={isLoadingOverviewStats ? `Loading ${tile.label}` : undefined}
              role={isLoadingOverviewStats ? 'status' : undefined}
            >
              {isLoadingOverviewStats ? (
                <>
                  <span className="sr-only">Loading {tile.label}</span>
                  <OverviewMetricLoader
                    valueWidth={tile.loaderValueWidth}
                    sublabelWidth={tile.loaderSublabelWidth}
                  />
                </>
              ) : (
                <>
                  <span className="text-3xl font-medium tracking-tight text-black dark:text-white">
                    {tile.value}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">{tile.sublabel}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 md:p-14 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors">
        <span className="text-[10px] font-mono font-semibold text-zinc-500 tracking-widest uppercase mb-6 block">
          Rails Platform
        </span>
        <h2 className="text-3xl md:text-4xl font-medium text-black dark:text-white mb-4 tracking-tight">
          Build modern money movement products faster.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl text-lg mb-8 leading-relaxed">
          Rails offers programmable accounts, immutable ledgering, and transaction orchestration so you can ship
          compliant financial products with confidence.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <MarketingDocsCtaLink
            data-testid="dashboard-overview-read-docs"
            className="inline-flex items-center justify-center bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white px-6 py-2.5 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Read Docs
          </MarketingDocsCtaLink>
        </div>
      </div>

    </div>
  );
};

export default DashboardOverviewV2;
