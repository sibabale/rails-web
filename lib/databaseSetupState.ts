'use client';

const databaseSetupStoragePrefix = 'rails_database_setup_completed';

const databaseSetupStorageKey = (environmentId?: string | null) =>
  environmentId ? `${databaseSetupStoragePrefix}:${environmentId}` : null;

export const readDatabaseSetupCompleted = (environmentId?: string | null): boolean => {
  if (typeof window === 'undefined') return false;
  const key = databaseSetupStorageKey(environmentId);
  if (!key) return false;

  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

export const markDatabaseSetupCompleted = (environmentId?: string | null) => {
  if (typeof window === 'undefined') return;
  const key = databaseSetupStorageKey(environmentId);
  if (!key) return;

  try {
    window.localStorage.setItem(key, 'true');
  } catch {
    // Persistence is best effort; live validation still drives the UI.
  }
};

export const isDatabaseSetupCompletedFromBackend = (
  response: { dbs_setup_completed_at?: string | null } | null | undefined
): boolean => {
  if (!response) return false;
  return Boolean(response.dbs_setup_completed_at);
};

export type DbsConnectedOnboardingAction = 'mark-complete' | 'mark-incomplete' | 'hold';

/** Monotonic Step 1: never regress after sticky localStorage or backend timestamp. */
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
