'use client';

import { useCallback, useMemo } from 'react';
import { defaultOnboardingState, type OnboardingState } from '@/lib/onboardingStorage';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  resetOnboardingForEnvironment,
  selectEnvironmentOnboardingProgress,
  setOnboardingStep,
} from '@/state/slices/onboardingSlice';

export type { OnboardingState };

export function useOnboarding(environmentId?: string | null) {
  const dispatch = useAppDispatch();
  const scopedProgress = useAppSelector((state) =>
    selectEnvironmentOnboardingProgress(state, environmentId)
  );
  const state = useMemo<OnboardingState>(
    () =>
      scopedProgress
        ? {
            dbsConnected: scopedProgress.dbsConnected,
            migrationsApplied: scopedProgress.migrationsApplied ?? false,
            apiKeyGenerated: scopedProgress.apiKeyGenerated,
            firstRequestSent: scopedProgress.firstRequestSent,
            dismissed: scopedProgress.dismissed,
          }
        : { ...defaultOnboardingState },
    [scopedProgress]
  );

  const updateStep = useCallback((key: keyof OnboardingState, value: boolean) => {
    if (!environmentId) return;
    dispatch(
      setOnboardingStep({
        environmentId,
        step: key,
        value,
      })
    );
  }, [dispatch, environmentId]);

  const resetOnboarding = useCallback(() => {
    if (!environmentId) return;
    dispatch(resetOnboardingForEnvironment({ environmentId }));
  }, [dispatch, environmentId]);

  const isComplete = state.dbsConnected && state.apiKeyGenerated && state.firstRequestSent;

  return { state, updateStep, resetOnboarding, isComplete };
}
