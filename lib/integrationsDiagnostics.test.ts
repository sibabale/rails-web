import { describe, expect, it, vi, afterEach } from 'vitest';
import { ApiRequestError } from '@/lib/apiRequestError';
import {
  formatIntegrationsLoadError,
  formatIntegrationsRefreshWarning,
  isIntegrationsDebugEnabled,
  logIntegrationsDebug,
} from '@/lib/integrationsDiagnostics';

describe('integrationsDiagnostics', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('detects debug flag from NEXT_PUBLIC_DEBUG_INTEGRATIONS', () => {
    vi.stubEnv('NEXT_PUBLIC_DEBUG_INTEGRATIONS', '1');
    expect(isIntegrationsDebugEnabled()).toBe(true);
    vi.stubEnv('NEXT_PUBLIC_DEBUG_INTEGRATIONS', '0');
    expect(isIntegrationsDebugEnabled()).toBe(false);
  });

  it('logs integration debug details when enabled', () => {
    vi.stubEnv('NEXT_PUBLIC_DEBUG_INTEGRATIONS', '1');
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    logIntegrationsDebug('test', { status: 403 });
    expect(info).toHaveBeenCalledWith('[integrations] test', { status: 403 });
  });

  it('formats production 403 load errors with membership guidance', () => {
    const err = new ApiRequestError("You don't have permission to perform this action.", {
      status: 403,
      path: '/api/v1/database-connections',
      correlationId: 'corr-1',
    });

    const message = formatIntegrationsLoadError(err, {
      environment: 'production',
      environmentId: 'prod-id',
      operation: 'list',
    });

    expect(message).toContain('Production');
    expect(message).toContain('admin membership');
    expect(message).not.toContain('cross-environment');
    expect(message).not.toBe("You don't have permission to perform this action.");
  });

  it('formats sandbox 403 load errors with membership guidance', () => {
    const err = new ApiRequestError("You don't have permission to perform this action.", {
      status: 403,
      path: '/api/v1/database-connections',
      correlationId: 'corr-3',
    });

    const message = formatIntegrationsLoadError(err, {
      environment: 'sandbox',
      environmentId: 'sandbox-id',
      operation: 'list',
    });

    expect(message).toContain('admin membership');
    expect(message).not.toBe("You don't have permission to perform this action.");
  });

  it('formats refresh warnings without using the generic permission string', () => {
    const err = new ApiRequestError("You don't have permission to perform this action.", {
      status: 403,
      path: '/api/v1/database-connections/migrations',
      correlationId: 'corr-2',
    });

    const message = formatIntegrationsRefreshWarning(err, {
      environment: 'sandbox',
      environmentId: 'sandbox-id',
      operation: 'migrations',
    });

    expect(message).toContain('migration health');
    expect(message).not.toBe("You don't have permission to perform this action.");
  });
});
