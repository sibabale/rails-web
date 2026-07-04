import { describe, expect, it } from 'vitest';
import reducer, {
  markDatabaseSetupCompletedForEnvironment,
  resetOnboardingForEnvironment,
  selectEnvironmentOnboardingProgress,
  setOnboardingSnapshot,
  setOnboardingStep,
} from './onboardingSlice';

describe('onboardingSlice', () => {
  const sandboxId = 'env-sandbox';
  const productionId = 'env-production';

  it('stores step updates in the targeted environment only', () => {
    let state = reducer(undefined, {
      type: 'init',
    });
    state = reducer(
      state,
      setOnboardingStep({
        environmentId: sandboxId,
        step: 'dbsConnected',
        value: true,
      })
    );

    expect(state.byEnvironmentId[sandboxId]?.dbsConnected).toBe(true);
    expect(state.byEnvironmentId[productionId]).toBeUndefined();
  });

  it('applies API snapshot progress by environment', () => {
    const state = reducer(
      undefined,
      setOnboardingSnapshot({
        environmentId: sandboxId,
        dbsConnected: true,
        apiKeyGenerated: true,
        firstRequestSent: false,
      })
    );

    expect(state.byEnvironmentId[sandboxId]).toMatchObject({
      dbsConnected: true,
      migrationsApplied: false,
      apiKeyGenerated: true,
      firstRequestSent: false,
      dbSetupCompletedSticky: true,
    });
  });

  it('marks sticky db setup completion and keeps it per environment', () => {
    const state = reducer(
      undefined,
      markDatabaseSetupCompletedForEnvironment({ environmentId: sandboxId })
    );

    expect(state.byEnvironmentId[sandboxId]).toMatchObject({
      dbsConnected: true,
      migrationsApplied: true,
      dbSetupCompletedSticky: true,
    });
    expect(state.byEnvironmentId[productionId]).toBeUndefined();
  });

  it('resets one environment without impacting others', () => {
    let state = reducer(
      undefined,
      setOnboardingStep({
        environmentId: sandboxId,
        step: 'apiKeyGenerated',
        value: true,
      })
    );
    state = reducer(
      state,
      setOnboardingStep({
        environmentId: productionId,
        step: 'firstRequestSent',
        value: true,
      })
    );
    state = reducer(state, resetOnboardingForEnvironment({ environmentId: sandboxId }));

    expect(state.byEnvironmentId[sandboxId]).toMatchObject({
      dbsConnected: false,
      migrationsApplied: false,
      apiKeyGenerated: false,
      firstRequestSent: false,
      dismissed: false,
      dbSetupCompletedSticky: false,
    });
    expect(state.byEnvironmentId[productionId]?.firstRequestSent).toBe(true);
  });

  it('returns null selector result for missing environments', () => {
    const state = reducer(undefined, { type: 'init' });
    const selected = selectEnvironmentOnboardingProgress({ onboarding: state }, sandboxId);
    expect(selected).toBeNull();
  });
});
