import type { DatabaseConnectionsResponse } from '@/lib/api';

export type OnboardingStepState = 'locked' | 'active' | 'complete';

export interface OnboardingSnapshot {
  /** Per-service list returned by GET /api/v1/database-connections. */
  connections: DatabaseConnectionsResponse | null;
  /** Whether the user has at least one active (non-revoked) API key for this env. */
  hasActiveApiKey: boolean;
  /** First-ever API key creation timestamp for the environment, or null. */
  apiKeyFirstCreatedAt: string | null;
  /** Whether the user has sent at least one successful API request in this env. */
  firstRequestSent: boolean;
}

export interface OnboardingStages {
  dbs: OnboardingStepState;
  apiKey: OnboardingStepState;
  firstRequest: OnboardingStepState;
}

const REQUIRED_SERVICES: ReadonlyArray<'accounts' | 'users' | 'ledger' | 'audit'> = [
  'accounts',
  'users',
  'ledger',
  'audit',
];

/**
 * Evaluate which onboarding stages should render as locked / active / complete.
 *
 * Pure function — no I/O, no localStorage. The DB snapshot passed in is the
 * source of truth.
 *
 * Rules:
 * 1. DB step is `complete` iff every required service in the snapshot is
 *    `status === 'connected'` AND the env's `dbs_setup_completed_at` is set.
 *    The timestamp alone is NOT enough — current snapshot must agree.
 * 2. DB step is `active` whenever the snapshot is loaded but not all four
 *    services are connected. Always shown as the first step (never locked).
 * 3. API key step is `locked` if DB step is not yet `complete`.
 * 4. API key step is `complete` iff `apiKeyFirstCreatedAt !== null`.
 *    (`hasActiveApiKey` is consulted only for in-page "manage keys" UI;
 *    the milestone is the first-ever creation.)
 * 5. API key step is `active` when DB is complete but the user has never
 *    issued a key.
 * 6. First-request step is `locked` until API-key step is `complete`.
 * 7. First-request step is `complete` when `firstRequestSent === true`.
 * 8. First-request step is `active` when the API-key step is complete but
 *    no request has been sent yet.
 *
 * If `connections` is null (snapshot not yet loaded), return all three
 * steps as `locked`. The caller should render a loading skeleton in that
 * case rather than mistaking it for a regression.
 */
export function evaluateOnboardingStages(snapshot: OnboardingSnapshot): OnboardingStages {
  if (snapshot.connections === null) {
    return { dbs: 'locked', apiKey: 'locked', firstRequest: 'locked' };
  }

  const allRequiredServicesConnected = REQUIRED_SERVICES.every((service) =>
    snapshot.connections!.connections.some(
      (connection) => connection.service === service && connection.status === 'connected'
    )
  );
  const dbsMilestoneStamped = Boolean(snapshot.connections.dbs_setup_completed_at);
  const dbs: OnboardingStepState =
    allRequiredServicesConnected && dbsMilestoneStamped ? 'complete' : 'active';

  let apiKey: OnboardingStepState;
  if (dbs !== 'complete') {
    apiKey = 'locked';
  } else if (snapshot.apiKeyFirstCreatedAt !== null) {
    apiKey = 'complete';
  } else {
    apiKey = 'active';
  }

  let firstRequest: OnboardingStepState;
  if (apiKey !== 'complete') {
    firstRequest = 'locked';
  } else if (snapshot.firstRequestSent) {
    firstRequest = 'complete';
  } else {
    firstRequest = 'active';
  }

  return { dbs, apiKey, firstRequest };
}
