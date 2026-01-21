import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EnvironmentMode = 'sandbox' | 'production';

interface EnvironmentState {
  mode: EnvironmentMode;
  environmentIds: Partial<Record<EnvironmentMode, string>>;
}

const initialState: EnvironmentState = {
  mode: 'sandbox',
  environmentIds: {},
};

const environmentSlice = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    setEnvironmentMode: (state, action: PayloadAction<EnvironmentMode>) => {
      state.mode = action.payload;
    },
    setEnvironmentIdForMode: (
      state,
      action: PayloadAction<{ mode: EnvironmentMode; environmentId: string }>,
    ) => {
      state.environmentIds[action.payload.mode] = action.payload.environmentId;
    },
    setSandbox: (state) => {
      state.mode = 'sandbox';
    },
    setProduction: (state) => {
      state.mode = 'production';
    },
  },
});

export const { setEnvironmentMode, setEnvironmentIdForMode, setSandbox, setProduction } = environmentSlice.actions;
export default environmentSlice.reducer;
