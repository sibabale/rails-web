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
