import { describe, expect, it } from 'vitest';
import {
  isDatabaseSetupCompletedFromBackend,
  resolveDbsConnectedOnboardingAction,
} from './databaseSetupState';

describe('isDatabaseSetupCompletedFromBackend', () => {
  it('returns false when response is null or undefined', () => {
    expect(isDatabaseSetupCompletedFromBackend(null)).toBe(false);
    expect(isDatabaseSetupCompletedFromBackend(undefined)).toBe(false);
  });

  it('returns false when dbs_setup_completed_at is missing or null', () => {
    expect(isDatabaseSetupCompletedFromBackend({})).toBe(false);
    expect(isDatabaseSetupCompletedFromBackend({ dbs_setup_completed_at: null })).toBe(false);
    expect(isDatabaseSetupCompletedFromBackend({ dbs_setup_completed_at: '' })).toBe(false);
  });

  it('returns true once dbs_setup_completed_at is set', () => {
    expect(
      isDatabaseSetupCompletedFromBackend({
        dbs_setup_completed_at: '2026-05-23T19:00:00.000Z',
      })
    ).toBe(true);
  });
});

describe('resolveDbsConnectedOnboardingAction', () => {
  it('marks complete when backend timestamp is present', () => {
    expect(
      resolveDbsConnectedOnboardingAction({
        stickyCompleted: false,
        summary: { dbs_setup_completed_at: '2026-05-24T00:00:00.000Z' },
        migrations: null,
      })
    ).toBe('mark-complete');
  });

  it('holds when sticky localStorage is set but overlay lacks timestamp', () => {
    expect(
      resolveDbsConnectedOnboardingAction({
        stickyCompleted: true,
        summary: {},
        migrations: {},
      })
    ).toBe('hold');
  });

  it('marks incomplete only for fresh environments', () => {
    expect(
      resolveDbsConnectedOnboardingAction({
        stickyCompleted: false,
        summary: {},
        migrations: {},
      })
    ).toBe('mark-incomplete');
  });
});
