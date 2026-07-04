export interface OnboardingState {
  dbsConnected: boolean;
  migrationsApplied: boolean;
  apiKeyGenerated: boolean;
  firstRequestSent: boolean;
  dismissed: boolean;
}

export const defaultOnboardingState: OnboardingState = {
  dbsConnected: false,
  migrationsApplied: false,
  apiKeyGenerated: false,
  firstRequestSent: false,
  dismissed: false,
};
