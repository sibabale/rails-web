import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

export type Environment = 'sandbox' | 'production';

interface EnvironmentState {
  current: Environment;
}

// Initial state MUST be sandbox (non-negotiable)
const initialState: EnvironmentState = {
  current: 'sandbox',
};

// Helper to validate and sanitize environment value
const validateEnvironment = (value: unknown): Environment => {
  if (value === 'sandbox' || value === 'production') {
    return value;
  }
  // Fallback to sandbox for any invalid value (corrupted state, missing, etc.)
  console.warn(`Invalid environment value: ${value}. Defaulting to sandbox.`);
  return 'sandbox';
};

const environmentSlice = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    setEnvironment: (state, action: PayloadAction<Environment>) => {
      // Validate that only valid environments are set
      state.current = validateEnvironment(action.payload);
    },
    resetToSandbox: (state) => {
      state.current = 'sandbox';
    },
  },
  // Handle rehydration from redux-persist - validate persisted state
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: any) => {
      // When rehydrating, validate the persisted environment value
      if (action.payload?.environment?.current) {
        state.current = validateEnvironment(action.payload.environment.current);
      } else {
        // If no persisted value or corrupted, default to sandbox
        state.current = 'sandbox';
      }
    });
  },
});

export const { setEnvironment, resetToSandbox } = environmentSlice.actions;
export default environmentSlice.reducer;
