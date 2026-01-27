import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import environmentReducer, { Environment } from './slices/environmentSlice';

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

// Root state type
export interface RootState {
  environment: { current: Environment };
}

// Configure store
export const store = configureStore({
  reducer: {
    environment: persistedEnvironmentReducer,
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

// Type-safe hooks
export type AppDispatch = typeof store.dispatch;

// Getter function to access store state outside React components
// Used by api.ts to get current environment
export const getStoreState = () => store.getState();
