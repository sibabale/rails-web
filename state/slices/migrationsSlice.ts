import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface MigrationUpdates {
  pendingMigrationCount: number;
  hasUpdatesAvailable: boolean;
}

interface MigrationsState {
  byEnvironmentId: Record<string, MigrationUpdates>;
}

const defaultMigrationUpdates: MigrationUpdates = {
  pendingMigrationCount: 0,
  hasUpdatesAvailable: false,
};

const initialState: MigrationsState = {
  byEnvironmentId: {},
};

const ensureEnvironmentEntry = (
  state: MigrationsState,
  environmentId: string
): MigrationUpdates => {
  const existing = state.byEnvironmentId[environmentId];
  if (existing) return existing;
  const created = { ...defaultMigrationUpdates };
  state.byEnvironmentId[environmentId] = created;
  return created;
};

interface MigrationUpdatesPayload extends MigrationUpdates {
  environmentId: string;
}

interface EnvironmentPayload {
  environmentId: string;
}

export const selectMigrationUpdatesForEnvironment = (
  state: { migrations: MigrationsState },
  environmentId?: string | null
): MigrationUpdates => {
  if (!environmentId) return defaultMigrationUpdates;
  return state.migrations.byEnvironmentId[environmentId] ?? defaultMigrationUpdates;
};

const migrationsSlice = createSlice({
  name: 'migrations',
  initialState,
  reducers: {
    setMigrationUpdatesForEnvironment: (
      state,
      action: PayloadAction<MigrationUpdatesPayload>
    ) => {
      const { environmentId, pendingMigrationCount, hasUpdatesAvailable } = action.payload;
      const entry = ensureEnvironmentEntry(state, environmentId);
      entry.pendingMigrationCount = pendingMigrationCount;
      entry.hasUpdatesAvailable = hasUpdatesAvailable;
    },
    resetMigrationUpdatesForEnvironment: (state, action: PayloadAction<EnvironmentPayload>) => {
      state.byEnvironmentId[action.payload.environmentId] = { ...defaultMigrationUpdates };
    },
    resetAllMigrationUpdates: (state) => {
      state.byEnvironmentId = {};
    },
  },
});

export const {
  setMigrationUpdatesForEnvironment,
  resetMigrationUpdatesForEnvironment,
  resetAllMigrationUpdates,
} = migrationsSlice.actions;
export default migrationsSlice.reducer;
