import { describe, expect, it } from 'vitest';
import { isDuplicateConnectionError } from './api';

describe('isDuplicateConnectionError', () => {
  it('parses valid 409 body', () => {
    const err = {
      status: 409,
      body: {
        error: { code: 'DUPLICATE_CONNECTION_STRING', conflicting_service: 'users' },
        message: 'This connection string is already in use by another service.',
      },
    };
    expect(isDuplicateConnectionError(err)).toEqual({ conflictingService: 'users' });
  });

  it('returns null on missing fields', () => {
    expect(isDuplicateConnectionError({ status: 409, body: {} })).toBeNull();
    expect(isDuplicateConnectionError({ status: 409, body: { error: {} } })).toBeNull();
    expect(
      isDuplicateConnectionError({
        status: 409,
        body: { error: { code: 'DUPLICATE_CONNECTION_STRING' } },
      })
    ).toBeNull();
    expect(
      isDuplicateConnectionError({
        status: 409,
        body: { error: { code: 'DUPLICATE_CONNECTION_STRING', conflicting_service: 'not-a-service' } },
      })
    ).toBeNull();
    expect(isDuplicateConnectionError(null)).toBeNull();
    expect(isDuplicateConnectionError(undefined)).toBeNull();
    expect(isDuplicateConnectionError('not an error object')).toBeNull();
  });

  it('returns null on non-409 responses', () => {
    expect(
      isDuplicateConnectionError({
        status: 500,
        body: { error: { code: 'DUPLICATE_CONNECTION_STRING', conflicting_service: 'users' } },
      })
    ).toBeNull();
    expect(
      isDuplicateConnectionError({
        status: 400,
        body: { error: { code: 'DUPLICATE_CONNECTION_STRING', conflicting_service: 'users' } },
      })
    ).toBeNull();
    expect(
      isDuplicateConnectionError({
        body: { error: { code: 'DUPLICATE_CONNECTION_STRING', conflicting_service: 'users' } },
      })
    ).toBeNull();
  });

  it('returns null on unrelated 409 codes', () => {
    expect(
      isDuplicateConnectionError({
        status: 409,
        body: { error: { code: 'OTHER_CONFLICT', conflicting_service: 'users' } },
      })
    ).toBeNull();
    expect(
      isDuplicateConnectionError({
        status: 409,
        body: { error: { code: 'CONNECTION_STRING_TAKEN', conflicting_service: 'users' } },
      })
    ).toBeNull();
  });
});
