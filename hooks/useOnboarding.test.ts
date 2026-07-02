import { afterEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LEGACY_ONBOARDING_STORAGE_KEY } from '@/lib/onboardingStorage';
import { useOnboarding } from './useOnboarding';

const sandboxId = 'env-sandbox-1';
const productionId = 'env-production-1';

describe('useOnboarding', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('reloads state when environmentId changes', () => {
    window.localStorage.setItem(
      `${LEGACY_ONBOARDING_STORAGE_KEY}:${sandboxId}`,
      JSON.stringify({
        dbsConnected: true,
        apiKeyGenerated: false,
        firstRequestSent: false,
        dismissed: false,
      })
    );
    window.localStorage.setItem(
      `${LEGACY_ONBOARDING_STORAGE_KEY}:${productionId}`,
      JSON.stringify({
        dbsConnected: false,
        apiKeyGenerated: false,
        firstRequestSent: false,
        dismissed: false,
      })
    );

    const { result, rerender } = renderHook(({ environmentId }) => useOnboarding(environmentId), {
      initialProps: { environmentId: sandboxId },
    });

    expect(result.current.state.dbsConnected).toBe(true);

    rerender({ environmentId: productionId });
    expect(result.current.state.dbsConnected).toBe(false);
  });

  it('persists updates to the scoped storage key', () => {
    const { result } = renderHook(() => useOnboarding(sandboxId));

    act(() => {
      result.current.updateStep('apiKeyGenerated', true);
    });

    const raw = window.localStorage.getItem(`${LEGACY_ONBOARDING_STORAGE_KEY}:${sandboxId}`);
    expect(raw).toContain('"apiKeyGenerated":true');
  });
});
