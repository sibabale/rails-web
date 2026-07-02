'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type IntegrationsTab = 'databases' | 'api-key';

const parseTab = (value: string | null): IntegrationsTab =>
  value === 'api-key' ? 'api-key' : 'databases';

export function useIntegrationsTab() {
  const router = useRouter();
  const params = useSearchParams();
  const active = parseTab(params.get('tab'));

  const select = useCallback(
    (tab: IntegrationsTab) => {
      const path =
        tab === 'api-key' ? '/dashboard/integrations?tab=api-key' : '/dashboard/integrations';
      router.replace(path, { scroll: false });
    },
    [router]
  );

  return { active, select };
}
