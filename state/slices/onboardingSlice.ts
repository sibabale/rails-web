import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultOnboardingState, type OnboardingState } from '@/lib/onboardingStorage';

export interface EnvironmentOnboardingProgress extends OnboardingState {
  dbSetupCompletedSticky: boolean;
}

interface OnboardingStateByEnvironment {
  byEnvironmentId: Record<string, EnvironmentOnboardingProgress>;
}

const defaultEnvironmentOnboardingProgress: EnvironmentOnboardingProgress = {
  ...defaultOnboardingState,
  dbSetupCompletedSticky: false,
};

const initialState: OnboardingStateByEnvironment = {
  byEnvironmentId: {},
};

const ensureEntry = (
  state: OnboardingStateByEnvironment,
  environmentId: string
): EnvironmentOnboardingProgress => {
  const existing = state.byEnvironmentId[environmentId];
  if (existing) return existing;
  const created = { ...defaultEnvironmentOnboardingProgress };
  state.byEnvironmentId[environmentId] = created;
  return created;
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingStep: (
      state,
      action: PayloadAction<{
        environmentId: string;
        step: keyof OnboardingState;
        value: boolean;
      }>
    ) => {
      const { environmentId, step, value } = action.payload;
      const entry = ensureEntry(state, environmentId);
      entry[step] = value;
    },
    resetOnboardingForEnvironment: (
      state,
      action: PayloadAction<{
        environmentId: string;
      }>
    ) => {
      const { environmentId } = action.payload;
      state.byEnvironmentId[environmentId] = { ...defaultEnvironmentOnboardingProgress };
    },
    setOnboardingSnapshot: (
      state,
      action: PayloadAction<{
        environmentId: string;
        dbsConnected: boolean;
        migrationsApplied?: boolean;
        apiKeyGenerated: boolean;
        firstRequestSent: boolean;
      }>
    ) => {
      const { environmentId, dbsConnected, migrationsApplied, apiKeyGenerated, firstRequestSent } =
        action.payload;
      const entry = ensureEntry(state, environmentId);
      entry.dbsConnected = dbsConnected;
      if (migrationsApplied !== undefined) {
        entry.migrationsApplied = migrationsApplied;
      }
      entry.apiKeyGenerated = apiKeyGenerated;
      entry.firstRequestSent = firstRequestSent;
      if (dbsConnected) {
        entry.dbSetupCompletedSticky = true;
      }
    },
    markDatabaseSetupCompletedForEnvironment: (
      state,
      action: PayloadAction<{
        environmentId: string;
      }>
    ) => {
      const { environmentId } = action.payload;
      const entry = ensureEntry(state, environmentId);
      entry.dbsConnected = true;
      entry.migrationsApplied = true;
      entry.dbSetupCompletedSticky = true;
    },
  },
});

export const {
  setOnboardingStep,
  resetOnboardingForEnvironment,
  setOnboardingSnapshot,
  markDatabaseSetupCompletedForEnvironment,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

export const selectEnvironmentOnboardingProgress = (
  state: { onboarding: OnboardingStateByEnvironment },
  environmentId?: string | null
): EnvironmentOnboardingProgress | null => {
  if (!environmentId) return null;
  return state.onboarding.byEnvironmentId[environmentId] ?? null;
};
