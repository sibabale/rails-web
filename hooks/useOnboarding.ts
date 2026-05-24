'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  defaultOnboardingState,
  readOnboardingStateForEnvironment,
  writeOnboardingStateForEnvironment,
  type OnboardingState,
} from '@/lib/onboardingStorage';

export type { OnboardingState };

export function useOnboarding(environmentId?: string | null) {
  const [state, setState] = useState<OnboardingState>(() =>
    readOnboardingStateForEnvironment(environmentId)
  );

  useEffect(() => {
    setState(readOnboardingStateForEnvironment(environmentId));
  }, [environmentId]);

  useEffect(() => {
    writeOnboardingStateForEnvironment(environmentId, state);
  }, [environmentId, state]);

  const updateStep = useCallback((key: keyof OnboardingState, value: boolean) => {
    setState((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({ ...defaultOnboardingState });
  }, []);

  const isComplete = state.dbsConnected && state.apiKeyGenerated && state.firstRequestSent;

  return { state, updateStep, resetOnboarding, isComplete };
}
