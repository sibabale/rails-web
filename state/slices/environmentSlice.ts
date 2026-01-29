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
      // ✅ CRITICAL: redux-persist REHYDRATE payload structure
      // When using slice-specific persist config (key: 'environment'), the payload
      // contains the persisted state DIRECTLY, not nested under 'environment'
      // The payload structure is: { current: Environment, _persist: {...} }
      // If no persisted state exists, payload will be undefined
      // If persisted state is corrupted, we validate and default to sandbox
      
      const persistedState = action.payload;
      
      // Check if we have persisted environment state
      // For slice-specific persist, the state is directly in payload, not nested
      if (persistedState?.current) {
        // Validate the persisted value - this ensures corrupted data defaults to sandbox
        state.current = validateEnvironment(persistedState.current);
      } else {
        // No persisted value exists (first load, cleared storage, etc.)
        // Default to sandbox (non-negotiable safety requirement)
        state.current = 'sandbox';
      }
    });
  },
});

export const { setEnvironment, resetToSandbox } = environmentSlice.actions;
export default environmentSlice.reducer;
