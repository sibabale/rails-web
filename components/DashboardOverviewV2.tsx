import React from 'react';
import { MarketingDocsCtaLink } from '@/components/marketing/atoms/MarketingDocsCtaLink';
import ApiKeyManager from './ApiKeyManager';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <ApiKeyManager session={session} />

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
