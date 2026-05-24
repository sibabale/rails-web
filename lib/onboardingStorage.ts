export interface OnboardingState {
  dbsConnected: boolean;
  apiKeyGenerated: boolean;
  firstRequestSent: boolean;
  dismissed: boolean;
}

export const LEGACY_ONBOARDING_STORAGE_KEY = 'rails_onboarding';

export const defaultOnboardingState: OnboardingState = {
  dbsConnected: false,
  apiKeyGenerated: false,
  firstRequestSent: false,
  dismissed: false,
};

export const onboardingStorageKey = (environmentId?: string | null): string | null =>
  environmentId ? `${LEGACY_ONBOARDING_STORAGE_KEY}:${environmentId}` : null;

export const parseOnboardingState = (raw: string | null): OnboardingState => {
  if (!raw) return { ...defaultOnboardingState };
  try {
    return { ...defaultOnboardingState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultOnboardingState };
  }
};

/** Read scoped onboarding state; migrates legacy global key into the given environment once. */
export const readOnboardingStateForEnvironment = (environmentId?: string | null): OnboardingState => {
  if (typeof window === 'undefined') return { ...defaultOnboardingState };

  const key = onboardingStorageKey(environmentId);
  if (!key) return { ...defaultOnboardingState };

  const scoped = window.localStorage.getItem(key);
  if (scoped) return parseOnboardingState(scoped);

  const legacy = window.localStorage.getItem(LEGACY_ONBOARDING_STORAGE_KEY);
  if (!legacy) return { ...defaultOnboardingState };

  const migrated = parseOnboardingState(legacy);
  try {
    window.localStorage.setItem(key, JSON.stringify(migrated));
    window.localStorage.removeItem(LEGACY_ONBOARDING_STORAGE_KEY);
  } catch {
    // Persistence is best effort.
  }
  return migrated;
};

export const writeOnboardingStateForEnvironment = (
  environmentId: string | null | undefined,
  state: OnboardingState
): void => {
  if (typeof window === 'undefined') return;
  const key = onboardingStorageKey(environmentId);
  if (!key) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Persistence is best effort.
  }
};
