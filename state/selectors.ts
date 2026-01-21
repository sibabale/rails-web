import { createSelector } from 'reselect';
import type { RootState } from './store';

const selectEnvironmentState = (state: RootState) => state.environment;

export const selectEnvironmentMode = createSelector(
  [selectEnvironmentState],
  (env) => env.mode,
);

export const selectIsProduction = createSelector(
  [selectEnvironmentMode],
  (mode) => mode === 'production',
);

export const selectEnvironmentIds = createSelector(
  [selectEnvironmentState],
  (env) => env.environmentIds,
);

export const selectEnvironmentIdForMode = (mode: 'sandbox' | 'production') =>
  createSelector([selectEnvironmentIds], (ids) => ids[mode] ?? null);

export const selectActiveEnvironmentId = createSelector(
  [selectEnvironmentMode, selectEnvironmentIds],
  (mode, ids) => ids[mode] ?? null,
);
