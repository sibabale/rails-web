import React from 'react';
import { SDK_SAMPLE_FOLDERS, samplesFolderUrl } from '../lib/samplesRepo';
import { getMarketingDocsHref } from '../lib/env';

interface DashboardOverviewV2Props {
  onGetStarted: () => void;
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

const DashboardOverviewV2: React.FC<DashboardOverviewV2Props> = ({
  onGetStarted,
  overviewStats = { activeAccounts: 0, postedEntries: 0, settledVolume: 0 },
  isLoadingOverviewStats = false,
  overviewCurrency = 'USD',
}) => {
  const overviewTiles = [
    {
      label: 'Active Accounts',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.activeAccounts),
      sublabel: 'accounts',
    },
    {
      label: 'Posted Transactions',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.postedEntries),
      sublabel: 'transactions',
    },
    {
      label: 'Settled Volume',
      value: isLoadingOverviewStats
        ? '—'
        : formatCurrency(overviewStats.settledVolume, overviewCurrency),
      sublabel: 'ledger',
    },
  ];

  const docsHref = getMarketingDocsHref();

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
            <div className="flex items-end justify-between">
              <span
                className={`text-3xl font-medium tracking-tight text-black dark:text-white ${
                  isLoadingOverviewStats ? 'animate-pulse' : ''
                }`}
              >
                {tile.value}
              </span>
              <span className="text-xs font-mono text-zinc-500">{tile.sublabel}</span>
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
          <button
            type="button"
            onClick={onGetStarted}
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Create Your First Account
          </button>
          <a
            href={docsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white px-6 py-2.5 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Read Docs
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Programmable Accounts',
            description: 'Provision multi-currency accounts with policy controls and real-time balances.',
          },
          {
            title: 'Immutable Ledger',
            description: 'Double-entry ledger with audit-ready traces and cryptographic integrity.',
          },
          {
            title: 'Payments Orchestration',
            description: 'Initiate transfers, manage settlement states, and route funds efficiently.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors"
          >
            <h3 className="text-xl font-medium tracking-tight text-black dark:text-white mb-3">{card.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="dashboard-overview-resources">
        <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-4">Documentation</span>
          <p className="text-base text-black dark:text-white font-medium mb-8">
            Explore the onboarding guide, API reference, and integration checklist.
          </p>
          <div className="mt-auto">
            <a
              href={docsHref}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
            >
              Go to Docs →
            </a>
          </div>
        </div>

        <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-4 block">SDKs</span>
          <p className="text-base text-black dark:text-white font-medium mb-6">Choose your stack and integrate in minutes.</p>
          <div className="flex flex-wrap gap-2">
            {['TypeScript', 'Python', 'Go', 'Ruby', 'Java', 'Kotlin', 'CLI'].map((sdk) => (
              <span
                key={sdk}
                className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-[11px] font-mono text-zinc-600 dark:text-zinc-400 transition-colors"
              >
                {sdk}
              </span>
            ))}
          </div>
        </div>

        <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors" data-testid="dashboard-samples">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-4 block">Samples</span>
          <p className="text-base text-black dark:text-white font-medium mb-6">
            Clone a reference app for your stack: install, set base URL and API key, run locally with Swagger.
          </p>
          <div className="flex flex-wrap gap-2">
            {SDK_SAMPLE_FOLDERS.map(({ id, label }) => (
              <a
                key={id}
                href={samplesFolderUrl(id)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                data-testid={`dashboard-sample-link-${id}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewV2;
