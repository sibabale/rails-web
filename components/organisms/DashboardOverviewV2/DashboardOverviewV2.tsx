import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { MarketingDocsCtaLink } from '@/components/molecules/MarketingDocsCtaLink/MarketingDocsCtaLink';
import OnboardingStepCard from '@/components/organisms/OnboardingStepCard/OnboardingStepCard';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  apiKeysApi,
  databaseConnectionsApi,
  type DatabaseConnectionsResponse,
} from '@/lib/api';
import {
  evaluateOnboardingStages,
  type OnboardingStages,
  type OnboardingStepState,
} from '@/lib/onboarding/evaluateOnboardingStages';
import { shouldHideOnboardingFlow } from '@/lib/onboarding/shouldHideOnboardingFlow';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { resolveEnvironmentId } from '@/lib/environment';
import { getMarketingDocsCtaUrl } from '@/lib/env';
import {
  selectEnvironmentOnboardingProgress,
  setOnboardingSnapshot,
} from '@/state/slices/onboardingSlice';

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

const OnboardingFlowSkeleton = () => (
  <div
    className="pointer-events-none absolute inset-0 z-20 p-2"
    data-testid="dashboard-overview-onboarding-skeleton"
    aria-hidden="true"
  >
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`onboarding-skeleton-${index}`}
          className="border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="h-7 w-7 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <span className="h-4 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="mb-3 h-4 w-32 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="mb-2 h-3 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="mb-6 h-3 w-5/6 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  </div>
);

const cachedStagesFromProgress = (
  progress: {
    dbsConnected: boolean;
    apiKeyGenerated: boolean;
    firstRequestSent: boolean;
  } | null
): OnboardingStages => {
  if (!progress) {
    return { dbs: 'locked', apiKey: 'locked', firstRequest: 'locked' };
  }
  const dbs: OnboardingStepState = progress.dbsConnected ? 'complete' : 'active';
  const apiKey: OnboardingStepState = progress.apiKeyGenerated
    ? 'complete'
    : dbs === 'complete'
      ? 'active'
      : 'locked';
  const firstRequest: OnboardingStepState = progress.firstRequestSent
    ? 'complete'
    : apiKey === 'complete'
      ? 'active'
      : 'locked';
  return { dbs, apiKey, firstRequest };
};

const DashboardOverviewV2: React.FC<DashboardOverviewV2Props> = ({
  overviewStats = { activeAccounts: 0, postedEntries: 0, settledVolume: 0 },
  isLoadingOverviewStats = false,
  overviewCurrency = 'USD',
  session,
}) => {
  const dispatch = useAppDispatch();
  const environment = useAppSelector((reduxState) => reduxState.environment.current);
  const environmentId = resolveEnvironmentId(session, environment);
  const cachedProgress = useAppSelector((state) =>
    selectEnvironmentOnboardingProgress(state, environmentId)
  );
  // `useOnboarding` continues to back the `dismissed` UI gesture only. Every
  // onboarding milestone (DB, API key, first request) is now derived from the
  // env-level DB snapshot returned by GET /api/v1/database-connections.
  const { state, updateStep } = useOnboarding(environmentId);
  const [connections, setConnections] = useState<DatabaseConnectionsResponse | null>(null);
  const [hasActiveApiKey, setHasActiveApiKey] = useState<boolean>(false);
  const hasCompletedFirstRequest = cachedProgress?.firstRequestSent ?? false;

  const stages: OnboardingStages = useMemo(
    () => {
      if (connections === null) {
        return cachedStagesFromProgress(cachedProgress);
      }
      return evaluateOnboardingStages({
        connections,
        hasActiveApiKey,
        apiKeyFirstCreatedAt: connections?.api_key_first_created_at ?? null,
        firstRequestSent:
          (connections?.first_request_sent_at ?? null) !== null ||
          (connections?.user_first_request_sent_at ?? null) !== null ||
          hasCompletedFirstRequest,
      });
    },
    [cachedProgress, connections, hasActiveApiKey, hasCompletedFirstRequest]
  );
  const hasKnownOnboardingState = connections !== null || cachedProgress !== null;
  const showOnboardingSkeleton = !hasKnownOnboardingState;

  const isComplete = shouldHideOnboardingFlow(stages);

  const handleSendTestRequest = () => {
    window.open(getMarketingDocsCtaUrl(), '_blank', 'noopener,noreferrer');
    updateStep('firstRequestSent', true);
    if (!session) return;
    void databaseConnectionsApi
      .markFirstRequestSent(session)
      .then((milestone) => {
        setConnections((current) => {
          if (!current) return current;
          return {
            ...current,
            user_first_request_sent_at: milestone.first_request_sent_at,
          };
        });
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[ONBOARDING] Failed to persist first request milestone: ${errorMessage}`);
      });
  };

  React.useEffect(() => {
    if (!session) return;
    // Hard-reset stale env data synchronously so the previous environment's
    // connections / api-key state never bleeds into the incoming environment's
    // render (RAI-60).  The evaluator treats null connections as "all locked",
    // which renders as a neutral pending/skeleton state until the fetch lands.
    setConnections(null);
    setHasActiveApiKey(false);
    let isActive = true;
    Promise.all([databaseConnectionsApi.list(session), apiKeysApi.list(session)])
      .then(([snapshot, keys]) => {
        if (!isActive) return;
        setConnections(snapshot);
        const activeKey = keys.some(
          (key) =>
            (key.environment_id || '') === (environmentId || '') &&
            (key.status || '').toLowerCase() === 'active'
        );
        setHasActiveApiKey(activeKey);
        if (environmentId) {
          const evaluated = evaluateOnboardingStages({
            connections: snapshot,
            hasActiveApiKey: activeKey,
            apiKeyFirstCreatedAt: snapshot.api_key_first_created_at ?? null,
            firstRequestSent:
              (snapshot.first_request_sent_at ?? null) !== null ||
              (snapshot.user_first_request_sent_at ?? null) !== null ||
              hasCompletedFirstRequest,
          });
          dispatch(
            setOnboardingSnapshot({
              environmentId,
              dbsConnected: evaluated.dbs === 'complete',
              apiKeyGenerated: evaluated.apiKey === 'complete',
              firstRequestSent: evaluated.firstRequest === 'complete',
            })
          );
        }
      })
      .catch(() => {
        // Network or auth failure: surface the loading-skeleton path by
        // keeping `connections` null. The evaluator returns "all locked",
        // which the renderer treats as a neutral pending state.
      });
    return () => {
      isActive = false;
    };
  }, [dispatch, session, environment, environmentId, hasCompletedFirstRequest]);

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
      {!state.dismissed && !isComplete && (
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

            <div
              className="relative grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
              aria-busy={showOnboardingSkeleton}
              data-testid="dashboard-overview-onboarding"
              data-stage-dbs={stages.dbs}
              data-stage-apikey={stages.apiKey}
              data-stage-firstrequest={stages.firstRequest}
              data-snapshot-loaded={hasKnownOnboardingState ? 'true' : 'false'}
            >
              <div className={showOnboardingSkeleton ? 'opacity-0' : ''}>
                <OnboardingStepCard
                  stepNumber={1}
                  state={stages.dbs}
                  testId="onboarding-step-dbs"
                  title="Connect Databases"
                  description="Provide PostgreSQL connection strings so Rails can work with your own infrastructure."
                  cta={
                    stages.dbs === 'complete' ? (
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
                    )
                  }
                />
              </div>

              <div className={showOnboardingSkeleton ? 'opacity-0' : ''}>
                <OnboardingStepCard
                  stepNumber={2}
                  state={stages.apiKey}
                  testId="onboarding-step-apikey"
                  title="Generate API Key"
                  description="Create a secure token to authenticate application requests against the Rails API."
                  cta={
                    stages.apiKey === 'locked' ? (
                      <button
                        type="button"
                        disabled
                        className="w-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
                      >
                        Locked
                      </button>
                    ) : stages.apiKey === 'complete' ? (
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
                    )
                  }
                />
              </div>

              <div className={showOnboardingSkeleton ? 'opacity-0' : ''}>
                <OnboardingStepCard
                  stepNumber={3}
                  state={stages.firstRequest}
                  testId="onboarding-step-first-request"
                  title="Send First Request"
                  description="Verify the setup by sending your first test request through the Rails API."
                  cta={
                    stages.firstRequest === 'locked' ? (
                      <button
                        type="button"
                        disabled
                        className="w-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
                      >
                        Locked
                      </button>
                    ) : stages.firstRequest === 'complete' ? (
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
                        className="flex w-full items-center justify-center gap-2 bg-black px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                      >
                        Open Docs
                      </button>
                    )
                  }
                />
              </div>
              {showOnboardingSkeleton ? <OnboardingFlowSkeleton /> : null}
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
