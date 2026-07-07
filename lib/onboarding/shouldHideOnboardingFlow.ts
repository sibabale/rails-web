import type { OnboardingStages } from './evaluateOnboardingStages';

export function shouldHideOnboardingFlow(stages: OnboardingStages): boolean {
  return (
    stages.dbs === 'complete' &&
    stages.apiKey === 'complete' &&
    stages.firstRequest === 'complete'
  );
}
