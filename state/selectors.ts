import { createSelector } from 'reselect';
import type { RootState } from './store';

const selectEnvironmentState = (state: RootState) => state.environment;

export const selectEnvironmentCurrent = createSelector(
  [selectEnvironmentState],
  (env) => env.current,
);

export const selectIsProduction = createSelector(
  [selectEnvironmentCurrent],
  (current) => current === 'production',
);
