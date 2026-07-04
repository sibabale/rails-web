import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useOnboarding } from './useOnboarding';
import environmentReducer from '@/state/slices/environmentSlice';
import onboardingReducer from '@/state/slices/onboardingSlice';

const sandboxId = 'env-sandbox-1';
const productionId = 'env-production-1';

const makeStore = () =>
  configureStore({
    reducer: {
      environment: environmentReducer,
      onboarding: onboardingReducer,
    },
  });

describe('useOnboarding (redux-persist state model)', () => {
  it('keeps onboarding state isolated per environment', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);

    const sandboxHook = renderHook(() => useOnboarding(sandboxId), { wrapper });
    const productionHook = renderHook(() => useOnboarding(productionId), { wrapper });

    expect(sandboxHook.result.current.state.dbsConnected).toBe(false);
    expect(sandboxHook.result.current.state.migrationsApplied).toBe(false);
    expect(productionHook.result.current.state.dbsConnected).toBe(false);
    expect(productionHook.result.current.state.migrationsApplied).toBe(false);
    act(() => {
      sandboxHook.result.current.updateStep('dbsConnected', true);
    });
    expect(sandboxHook.result.current.state.dbsConnected).toBe(true);
    expect(productionHook.result.current.state.dbsConnected).toBe(false);
  });

  it('marks the flow complete only when all milestones are true', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);
    const { result } = renderHook(() => useOnboarding(sandboxId), { wrapper });

    expect(result.current.isComplete).toBe(false);
    act(() => {
      result.current.updateStep('dbsConnected', true);
      result.current.updateStep('apiKeyGenerated', true);
    });
    expect(result.current.isComplete).toBe(false);
    act(() => {
      result.current.updateStep('firstRequestSent', true);
    });
    expect(result.current.isComplete).toBe(true);
  });
});
