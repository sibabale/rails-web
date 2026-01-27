import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import environmentReducer, { Environment } from './slices/environmentSlice';

// Persist config for environment slice only
const environmentPersistConfig: PersistConfig<{ current: Environment }> = {
  key: 'environment',
  storage,
  // Only persist the environment slice
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
