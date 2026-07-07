import { describe, expect, it } from 'vitest';
import reducer, {
  resetAllMigrationUpdates,
  resetMigrationUpdatesForEnvironment,
  selectMigrationUpdatesForEnvironment,
  setMigrationUpdatesForEnvironment,
} from './migrationsSlice';

describe('migrationsSlice', () => {
  it('defaults update state to no updates', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.byEnvironmentId).toEqual({});
  });

  it('stores pending update metrics per environment', () => {
    const state = reducer(
      undefined,
      setMigrationUpdatesForEnvironment({
        environmentId: 'env-sandbox',
        pendingMigrationCount: 4,
        hasUpdatesAvailable: true,
      })
    );
    expect(state.byEnvironmentId['env-sandbox']).toEqual({
      pendingMigrationCount: 4,
      hasUpdatesAvailable: true,
    });
  });

  it('resets one environment without touching others', () => {
    const seededState = reducer(
      reducer(
        undefined,
        setMigrationUpdatesForEnvironment({
          environmentId: 'env-sandbox',
          pendingMigrationCount: 2,
          hasUpdatesAvailable: true,
        })
      ),
      setMigrationUpdatesForEnvironment({
        environmentId: 'env-production',
        pendingMigrationCount: 1,
        hasUpdatesAvailable: true,
      })
    );

    const state = reducer(
      seededState,
      resetMigrationUpdatesForEnvironment({ environmentId: 'env-sandbox' })
    );
    expect(state.byEnvironmentId['env-sandbox']).toEqual({
      pendingMigrationCount: 0,
      hasUpdatesAvailable: false,
    });
    expect(state.byEnvironmentId['env-production']).toEqual({
      pendingMigrationCount: 1,
      hasUpdatesAvailable: true,
    });
  });

  it('clears all environments', () => {
    const seededState = reducer(
      undefined,
      setMigrationUpdatesForEnvironment({
        environmentId: 'env-sandbox',
        pendingMigrationCount: 3,
        hasUpdatesAvailable: true,
      })
    );
    const state = reducer(seededState, resetAllMigrationUpdates());
    expect(state.byEnvironmentId).toEqual({});
  });

  it('selector returns defaults when environment is missing', () => {
    const state = {
      migrations: reducer(undefined, { type: 'init' }),
    };
    expect(selectMigrationUpdatesForEnvironment(state, null)).toEqual({
      pendingMigrationCount: 0,
      hasUpdatesAvailable: false,
    });
  });
});
