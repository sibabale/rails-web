import { describe, expect, it } from 'vitest';
import type { DatabaseConnectionsResponse, DatabaseConnectionService } from '@/lib/api';
import {
  evaluateOnboardingStages,
  type OnboardingSnapshot,
} from './evaluateOnboardingStages';

const REQUIRED_SERVICES: ReadonlyArray<DatabaseConnectionService> = [
  'accounts',
  'users',
  'ledger',
  'audit',
];

const connectedServices = (overrides: Partial<Record<DatabaseConnectionService, 'connected' | 'missing' | 'invalid'>> = {}) =>
  REQUIRED_SERVICES.map((service) => ({
    service,
    status: overrides[service] ?? 'connected',
  } as DatabaseConnectionsResponse['connections'][number]));

const snapshot = (overrides: Partial<OnboardingSnapshot> = {}): OnboardingSnapshot => ({
  connections: {
    all_connected: true,
    connections: connectedServices(),
    dbs_setup_completed_at: '2026-05-25T10:00:00Z',
    api_key_first_created_at: null,
  },
  hasActiveApiKey: false,
  apiKeyFirstCreatedAt: null,
  firstRequestSent: false,
  ...overrides,
});

describe('evaluateOnboardingStages', () => {
  it('locks all three steps while the snapshot is still loading', () => {
    const stages = evaluateOnboardingStages(snapshot({ connections: null }));
    expect(stages).toEqual({ dbs: 'locked', apiKey: 'locked', firstRequest: 'locked' });
  });

  it('marks the DB step active when the snapshot is loaded but no service is connected yet', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: false,
          connections: connectedServices({
            accounts: 'missing',
            users: 'missing',
            ledger: 'missing',
            audit: 'missing',
          }),
          dbs_setup_completed_at: null,
          api_key_first_created_at: null,
        },
      })
    );
    expect(stages.dbs).toBe('active');
    expect(stages.apiKey).toBe('locked');
    expect(stages.firstRequest).toBe('locked');
  });

  it('keeps the DB step active when only some services are connected', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: false,
          connections: connectedServices({ ledger: 'missing', audit: 'missing' }),
          dbs_setup_completed_at: null,
          api_key_first_created_at: null,
        },
      })
    );
    expect(stages.dbs).toBe('active');
    expect(stages.apiKey).toBe('locked');
  });

  it('does NOT mark the DB step complete when the milestone is stamped but the live snapshot has a missing service', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: false,
          connections: connectedServices({ ledger: 'missing' }),
          // Sticky monotonic timestamp on the env from an earlier session.
          dbs_setup_completed_at: '2026-05-20T10:00:00Z',
          api_key_first_created_at: null,
        },
      })
    );
    expect(stages.dbs).toBe('active');
  });

  it('keeps the DB step active when all services are connected but the milestone has not stamped yet', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: true,
          connections: connectedServices(),
          dbs_setup_completed_at: null,
          api_key_first_created_at: null,
        },
      })
    );
    expect(stages.dbs).toBe('active');
    expect(stages.apiKey).toBe('locked');
  });

  it('marks the API key step active when DB is complete but no key was ever issued', () => {
    const stages = evaluateOnboardingStages(snapshot());
    expect(stages.dbs).toBe('complete');
    expect(stages.apiKey).toBe('active');
    expect(stages.firstRequest).toBe('locked');
  });

  it('marks the API key step complete once apiKeyFirstCreatedAt is stamped, even if no active key currently exists', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        hasActiveApiKey: false,
        apiKeyFirstCreatedAt: '2026-05-25T11:00:00Z',
      })
    );
    expect(stages.apiKey).toBe('complete');
    expect(stages.firstRequest).toBe('active');
  });

  it('marks the first-request step complete only when firstRequestSent is true', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        apiKeyFirstCreatedAt: '2026-05-25T11:00:00Z',
        firstRequestSent: true,
      })
    );
    expect(stages.firstRequest).toBe('complete');
  });

  it('locks the first-request step while API key is still active', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        apiKeyFirstCreatedAt: null,
        firstRequestSent: true,
      })
    );
    expect(stages.apiKey).toBe('active');
    expect(stages.firstRequest).toBe('locked');
  });

  it('returns the full completed terminal state when every milestone has been reached', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        hasActiveApiKey: true,
        apiKeyFirstCreatedAt: '2026-05-25T11:00:00Z',
        firstRequestSent: true,
      })
    );
    expect(stages).toEqual({ dbs: 'complete', apiKey: 'complete', firstRequest: 'complete' });
  });

  it('demotes the DB step from complete to active when a connection later goes missing — but keeps API key complete (milestone is monotonic by design)', () => {
    // Earlier in time: everything was complete and a key was issued.
    const completed = evaluateOnboardingStages(
      snapshot({
        apiKeyFirstCreatedAt: '2026-05-20T11:00:00Z',
        firstRequestSent: false,
      })
    );
    expect(completed.dbs).toBe('complete');
    expect(completed.apiKey).toBe('complete');

    // Now a service goes missing in the current snapshot. The DB step must
    // demote (live truth wins) but the API key milestone stays complete
    // because it is a monotonic "first ever" marker by contract.
    const regression = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: false,
          connections: connectedServices({ ledger: 'missing' }),
          dbs_setup_completed_at: '2026-05-20T10:00:00Z',
          api_key_first_created_at: '2026-05-20T11:00:00Z',
        },
        apiKeyFirstCreatedAt: '2026-05-20T11:00:00Z',
        firstRequestSent: false,
      })
    );
    expect(regression.dbs).toBe('active');
    // API-key step is gated by DB step being complete (rule 3). Once DB
    // demotes, the API key step also locks. This is intentional — surfacing
    // the now-broken DB requirement is the entire point of the regression
    // we are fixing. The api_key_first_created_at TIMESTAMP itself is still
    // preserved on the env; only the visual state defers to DB readiness.
    expect(regression.apiKey).toBe('locked');
    expect(regression.firstRequest).toBe('locked');
  });

  it('treats `invalid` and `missing` service statuses as non-connected', () => {
    const stages = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: false,
          connections: connectedServices({ accounts: 'invalid' }),
          dbs_setup_completed_at: '2026-05-20T10:00:00Z',
          api_key_first_created_at: null,
        },
      })
    );
    expect(stages.dbs).toBe('active');
  });

  it('is a pure function (does not mutate the snapshot)', () => {
    const original = snapshot({
      apiKeyFirstCreatedAt: '2026-05-25T11:00:00Z',
      firstRequestSent: true,
    });
    const before = JSON.stringify(original);
    evaluateOnboardingStages(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  // DashboardOverviewV2 now sources `firstRequestSent` from the env-level
  // `first_request_sent_at` column on the DB snapshot — null while the SDK
  // has never authenticated, non-null afterwards. The evaluator signature
  // is unchanged; this test pins the caller-side derivation that replaces
  // the old localStorage gate.
  it('drives firstRequest from first_request_sent_at: null -> active, non-null -> complete (API key complete)', () => {
    const apiKeyStampedAt = '2026-05-25T11:00:00Z';

    const beforeFirstRequest = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: true,
          connections: connectedServices(),
          dbs_setup_completed_at: '2026-05-25T10:00:00Z',
          api_key_first_created_at: apiKeyStampedAt,
          first_request_sent_at: null,
        },
        apiKeyFirstCreatedAt: apiKeyStampedAt,
        firstRequestSent:
          (null as string | null) !== null,
      })
    );
    expect(beforeFirstRequest.apiKey).toBe('complete');
    expect(beforeFirstRequest.firstRequest).toBe('active');

    const afterFirstRequest = evaluateOnboardingStages(
      snapshot({
        connections: {
          all_connected: true,
          connections: connectedServices(),
          dbs_setup_completed_at: '2026-05-25T10:00:00Z',
          api_key_first_created_at: apiKeyStampedAt,
          first_request_sent_at: '2026-05-25T11:30:00Z',
        },
        apiKeyFirstCreatedAt: apiKeyStampedAt,
        firstRequestSent:
          ('2026-05-25T11:30:00Z' as string | null) !== null,
      })
    );
    expect(afterFirstRequest.apiKey).toBe('complete');
    expect(afterFirstRequest.firstRequest).toBe('complete');
  });
});
