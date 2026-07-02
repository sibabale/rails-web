import { afterEach, describe, expect, it } from 'vitest';
import {
  LEGACY_ONBOARDING_STORAGE_KEY,
  onboardingStorageKey,
  readOnboardingStateForEnvironment,
  writeOnboardingStateForEnvironment,
} from './onboardingStorage';

const sandboxId = 'env-sandbox-1';
const productionId = 'env-production-1';

describe('onboardingStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('uses per-environment keys', () => {
    expect(onboardingStorageKey(sandboxId)).toBe(`${LEGACY_ONBOARDING_STORAGE_KEY}:${sandboxId}`);
    expect(onboardingStorageKey(null)).toBeNull();
  });

  it('isolates onboarding flags per environment', () => {
    writeOnboardingStateForEnvironment(sandboxId, {
      dbsConnected: true,
      apiKeyGenerated: true,
      firstRequestSent: false,
      dismissed: false,
    });
    writeOnboardingStateForEnvironment(productionId, {
      dbsConnected: false,
      apiKeyGenerated: false,
      firstRequestSent: false,
      dismissed: false,
    });

    expect(readOnboardingStateForEnvironment(sandboxId).dbsConnected).toBe(true);
    expect(readOnboardingStateForEnvironment(productionId).dbsConnected).toBe(false);
  });

  it('migrates legacy global key into the first environment read', () => {
    window.localStorage.setItem(
      LEGACY_ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        dbsConnected: true,
        apiKeyGenerated: false,
        firstRequestSent: false,
        dismissed: false,
      })
    );

    const state = readOnboardingStateForEnvironment(sandboxId);
    expect(state.dbsConnected).toBe(true);
    expect(window.localStorage.getItem(LEGACY_ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(onboardingStorageKey(sandboxId)!)).toContain('"dbsConnected":true');
  });
});
