import { describe, expect, it } from 'vitest';
import { databaseConnectionsApi } from './index';

describe('databaseConnectionsApi service-specific save methods', () => {
  it('exposes dedicated save methods per database service', () => {
    expect(typeof databaseConnectionsApi.saveAccountsConnection).toBe('function');
    expect(typeof databaseConnectionsApi.saveUsersConnection).toBe('function');
    expect(typeof databaseConnectionsApi.saveLedgerConnection).toBe('function');
    expect(typeof databaseConnectionsApi.saveAuditConnection).toBe('function');
  });
});
