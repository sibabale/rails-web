'use client';

import { store, getStoreState } from '@/state/store';
import { markDatabaseSetupCompletedForEnvironment } from '@/state/slices/onboardingSlice';

export const readDatabaseSetupCompleted = (environmentId?: string | null): boolean => {
  if (!environmentId) return false;
  return Boolean(getStoreState().onboarding.byEnvironmentId[environmentId]?.dbSetupCompletedSticky);
};

export const markDatabaseSetupCompleted = (environmentId?: string | null) => {
  if (!environmentId) return;
  store.dispatch(markDatabaseSetupCompletedForEnvironment({ environmentId }));
};

export const isDatabaseSetupCompletedFromBackend = (
  response: { dbs_setup_completed_at?: string | null } | null | undefined
): boolean => {
  if (!response) return false;
  return Boolean(response.dbs_setup_completed_at);
};

export type DbsConnectedOnboardingAction = 'mark-complete' | 'mark-incomplete' | 'hold';

/** Monotonic Step 1: never regress after sticky redux snapshot or backend timestamp. */
export function resolveDbsConnectedOnboardingAction(params: {
  stickyCompleted: boolean;
  summary: { dbs_setup_completed_at?: string | null } | null | undefined;
  migrations: { dbs_setup_completed_at?: string | null } | null | undefined;
}): DbsConnectedOnboardingAction {
  const backendCompleted =
    isDatabaseSetupCompletedFromBackend(params.summary) ||
    isDatabaseSetupCompletedFromBackend(params.migrations);

  if (backendCompleted) {
    return 'mark-complete';
  }
  if (params.stickyCompleted) {
    return 'hold';
  }
  return 'mark-incomplete';
}
