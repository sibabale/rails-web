import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import environmentReducer, { Environment } from './slices/environmentSlice';
import onboardingReducer from './slices/onboardingSlice';

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: unknown) {
    return Promise.resolve(value);
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// ✅ CRITICAL: Persist config for environment slice only
// This ensures the environment selection persists across:
// - Hard refresh
// - Browser restart
// - Tab close/reopen
// - Cleared Redux state (but not localStorage)
const environmentPersistConfig: PersistConfig<{ current: Environment }> = {
  key: 'environment',
  storage, // Uses localStorage by default
  // Only persist the environment slice (not other state)
  // If persisted value is missing or invalid, the slice's REHYDRATE handler defaults to 'sandbox'
};

// Create persisted reducer
const persistedEnvironmentReducer = persistReducer(
  environmentPersistConfig,
  environmentReducer
);

type OnboardingPersistState = {
  byEnvironmentId: Record<
    string,
    {
      dbsConnected: boolean;
      migrationsApplied: boolean;
      apiKeyGenerated: boolean;
      firstRequestSent: boolean;
      dismissed: boolean;
      dbSetupCompletedSticky: boolean;
    }
  >;
};

const onboardingPersistConfig: PersistConfig<OnboardingPersistState> = {
  key: 'onboarding',
  storage,
};

const persistedOnboardingReducer = persistReducer(onboardingPersistConfig, onboardingReducer);

// Configure store
export const store = configureStore({
  reducer: {
    environment: persistedEnvironmentReducer,
    onboarding: persistedOnboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Getter function to access store state outside React components
// Used by api.ts to get current environment
export const getStoreState = () => store.getState();
