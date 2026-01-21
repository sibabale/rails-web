import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EnvironmentMode = 'sandbox' | 'production';

interface EnvironmentState {
  mode: EnvironmentMode;
}

const initialState: EnvironmentState = {
  mode: 'sandbox',
};

const environmentSlice = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    setEnvironmentMode: (state, action: PayloadAction<EnvironmentMode>) => {
      state.mode = action.payload;
    },
    setSandbox: (state) => {
      state.mode = 'sandbox';
    },
    setProduction: (state) => {
      state.mode = 'production';
    },
  },
});

export const { setEnvironmentMode, setSandbox, setProduction } = environmentSlice.actions;
export default environmentSlice.reducer;
