'use client';

import type { IntegrationsTab } from '@/components/pages/integrations/hooks/useIntegrationsTab';

interface IntegrationsTabsProps {
  active: IntegrationsTab;
  onSelect: (tab: IntegrationsTab) => void;
}

const TABS: { id: IntegrationsTab; label: string; testId: string }[] = [
  { id: 'databases', label: 'Databases', testId: 'integrations-tab-databases' },
  { id: 'api-key', label: 'API Key', testId: 'integrations-tab-api-key' },
];

export default function IntegrationsTabs({ active, onSelect }: IntegrationsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Integrations sections"
      className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`integrations-tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`integrations-panel-${tab.id}`}
          data-testid={tab.testId}
          onClick={() => onSelect(tab.id)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            active === tab.id
              ? 'border-black text-black dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
