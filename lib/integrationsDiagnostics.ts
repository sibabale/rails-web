import type { Environment } from '@/state/slices/environmentSlice';
import { isApiRequestError } from '@/lib/apiRequestError';

export type IntegrationsErrorContext = {
  environment: Environment;
  environmentId: string | null;
  operation: string;
};

export function isIntegrationsDebugEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_DEBUG_INTEGRATIONS?.trim().toLowerCase();
  return flag === '1' || flag === 'true';
}

export function logIntegrationsDebug(
  message: string,
  details?: Record<string, unknown>
): void {
  if (!isIntegrationsDebugEnabled()) {
    return;
  }
  if (details) {
    console.info(`[integrations] ${message}`, details);
    return;
  }
  console.info(`[integrations] ${message}`);
}

export function formatIntegrationsLoadError(
  err: unknown,
  context: IntegrationsErrorContext
): string {
  if (isApiRequestError(err)) {
    logIntegrationsDebug('API failure', {
      operation: context.operation,
      status: err.status,
      path: err.path,
      correlationId: err.correlationId,
      environment: context.environment,
      environmentId: context.environmentId,
    });

    if (err.status === 403) {
      if (context.environment === 'production') {
        return 'Unable to manage Production database connections. You need an active admin membership for this Production environment. Ask a business admin to grant access, or switch to Sandbox if you only have Sandbox permissions.';
      }
      return "You don't have permission to manage database connections in Sandbox. Confirm you have an active admin membership for this environment.";
    }
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }

  return 'Failed to load database connections.';
}

export function formatIntegrationsRefreshWarning(
  err: unknown,
  context: IntegrationsErrorContext
): string {
  if (isApiRequestError(err)) {
    logIntegrationsDebug('Background refresh failure', {
      operation: context.operation,
      status: err.status,
      path: err.path,
      correlationId: err.correlationId,
      environment: context.environment,
      environmentId: context.environmentId,
    });
  } else {
    logIntegrationsDebug('Background refresh failure', {
      operation: context.operation,
      environment: context.environment,
      environmentId: context.environmentId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return 'Saved connections are shown, but migration health could not be refreshed. Retry by switching tabs or reloading the page.';
}
