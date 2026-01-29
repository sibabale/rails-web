import { describe, it, expect } from 'vitest';
import { REHYDRATE } from 'redux-persist';
import reducer, { setEnvironment } from '../state/slices/environmentSlice';

describe('environmentSlice', () => {
  it('defaults to sandbox', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.current).toBe('sandbox');
  });

  it('accepts a valid environment', () => {
    const state = reducer(undefined, setEnvironment('production'));
    expect(state.current).toBe('production');
  });

  it('rehydrates to sandbox for invalid values', () => {
    const state = reducer(undefined, {
      type: REHYDRATE,
      payload: { current: 'invalid' },
    });
    expect(state.current).toBe('sandbox');
  });

  it('rehydrates to production when persisted value is valid', () => {
    const state = reducer(undefined, {
      type: REHYDRATE,
      payload: { current: 'production' },
    });
    expect(state.current).toBe('production');
  });
});
