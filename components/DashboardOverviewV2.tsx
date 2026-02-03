import React, { useState } from 'react';
import SettledVolumeChart from './SettledVolumeChart';

interface DashboardOverviewV2Props {
  onGetStarted: () => void;
  overviewStats?: {
    activeUsers: number;
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
  overviewStats = { activeUsers: 0, activeAccounts: 0, postedEntries: 0, settledVolume: 0 },
  isLoadingOverviewStats = false,
  overviewCurrency = 'USD',
  session,
}) => {
  const [settledVolumeRange, setSettledVolumeRange] = useState<'ALL' | '1D' | '1H'>('ALL');
  const [settledVolumeDisplay, setSettledVolumeDisplay] = useState<string>('—');
  const [settledVolumeCurrency, setSettledVolumeCurrency] = useState('USD');
  const [isLoadingSettledVolume, setIsLoadingSettledVolume] = useState(false);

  const handleSettledVolumeStats = (stats: { totalAmount: number; currency: string }) => {
    setSettledVolumeCurrency(stats.currency);
    const formatted = formatCurrency(stats.totalAmount, stats.currency);
    setSettledVolumeDisplay(formatted);
  };
  const overviewTiles = [
    {
      label: 'Active Users',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.activeUsers),
      sublabel: 'users',
    },
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewTiles.map((tile) => (
          <div key={tile.label} className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-4 rounded-xl flex flex-col justify-between shadow-sm">
            <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{tile.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-lg font-bold tracking-tight text-zinc-800 dark:text-white ${isLoadingOverviewStats ? 'animate-pulse' : ''}`}>
                {tile.value}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">{tile.sublabel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400">Rails Platform</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Build modern money movement products faster.
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Rails offers programmable accounts, immutable ledgering, and transaction orchestration so you can ship
          compliant financial products with confidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onGetStarted}
            className="px-5 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold"
          >
            Create Your First Account
          </button>
          <a
            href="https://docs.rails.co.za"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300"
          >
            Read Docs
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden group transition-colors shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                  Settled Volume ({settledVolumeRange === 'ALL' ? 'All Time' : settledVolumeRange === '1H' ? '1h' : '24h'})
                </p>
                <h2 className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-white">{settledVolumeDisplay}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettledVolumeRange('ALL')}
                  className={`text-[10px] font-mono border px-2 py-1 rounded ${
                    settledVolumeRange === 'ALL'
                      ? 'bg-zinc-800 dark:bg-white text-white dark:text-black border-zinc-800 dark:border-white'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                  aria-pressed={settledVolumeRange === 'ALL'}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => setSettledVolumeRange('1D')}
                  className={`text-[10px] font-mono border px-2 py-1 rounded ${
                    settledVolumeRange === '1D'
                      ? 'bg-zinc-800 dark:bg-white text-white dark:text-black border-zinc-800 dark:border-white'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                  aria-pressed={settledVolumeRange === '1D'}
                >
                  1D
                </button>
                <button
                  type="button"
                  onClick={() => setSettledVolumeRange('1H')}
                  className={`text-[10px] font-mono border px-2 py-1 rounded ${
                    settledVolumeRange === '1H'
                      ? 'bg-zinc-800 dark:bg-white text-white dark:text-black border-zinc-800 dark:border-white'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                  aria-pressed={settledVolumeRange === '1H'}
                >
                  1H
                </button>
              </div>
            </div>
            {session && (
              <SettledVolumeChart
                session={session}
                range={settledVolumeRange}
                onStatsChange={handleSettledVolumeStats}
                onLoadingChange={setIsLoadingSettledVolume}
              />
            )}
          </div>
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
            className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Documentation</h3>
          <p className="text-base text-zinc-700 dark:text-zinc-300">
            Explore the onboarding guide, API reference, and integration checklist.
          </p>
          <a
            href="https://docs.rails.co.za"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-semibold text-zinc-900 dark:text-white"
          >
            Go to Docs →
          </a>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">SDKs</h3>
          <p className="text-base text-zinc-700 dark:text-zinc-300">
            Choose your stack and integrate in minutes.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            {['TypeScript', 'Python', 'Go', 'Ruby', 'Java', 'Kotlin', 'CLI'].map((sdk) => (
              <span key={sdk} className="px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                {sdk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewV2;
