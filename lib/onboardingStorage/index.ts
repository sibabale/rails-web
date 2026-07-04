export interface OnboardingState {
  dbsConnected: boolean;
  initialMigrationsApplied: boolean;
  apiKeyGenerated: boolean;
  firstRequestSent: boolean;
  dismissed: boolean;
}

export const defaultOnboardingState: OnboardingState = {
  dbsConnected: false,
  initialMigrationsApplied: false,
  apiKeyGenerated: false,
  firstRequestSent: false,
  dismissed: false,
};
