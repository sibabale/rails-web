'use client';

import { useCallback, useEffect, useState } from 'react';

export interface OnboardingState {
  dbsConnected: boolean;
  apiKeyGenerated: boolean;
  firstRequestSent: boolean;
  dismissed: boolean;
}

const defaultState: OnboardingState = {
  dbsConnected: false,
  apiKeyGenerated: false,
  firstRequestSent: false,
  dismissed: false,
};

const storageKey = 'rails_onboarding';

const readOnboardingState = (): OnboardingState => {
  if (typeof window === 'undefined') return defaultState;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return defaultState;
    return { ...defaultState, ...JSON.parse(saved) };
  } catch {
    return defaultState;
  }
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(readOnboardingState);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.localStorage?.setItem !== 'function') return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Persistence is progressive enhancement; the dashboard remains usable without it.
    }
  }, [state]);

  const updateStep = useCallback((key: keyof OnboardingState, value: boolean) => {
    setState((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
  }, []);

  const isComplete = state.dbsConnected && state.apiKeyGenerated && state.firstRequestSent;

  return { state, updateStep, resetOnboarding, isComplete };
}
