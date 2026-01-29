import React from 'react';

interface DashboardOverviewV2Props {
  onGetStarted: () => void;
}

const DashboardOverviewV2: React.FC<DashboardOverviewV2Props> = ({ onGetStarted }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
