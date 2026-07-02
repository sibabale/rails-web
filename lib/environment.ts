import type { Environment } from '@/state/slices/environmentSlice';

export interface EnvironmentSession {
  environment_id?: string;
  environments?: { id: string; type: string }[];
}

/** Resolve the UUID for the active environment mode; never fall back to sandbox when production is selected. */
export const resolveEnvironmentId = (
  session: EnvironmentSession | null | undefined,
  mode: Environment
): string | null => {
  if (!session) return null;

  const matched = session.environments?.find((env) => env.type === mode)?.id;
  if (matched) return matched;

  if (mode === 'production') return null;

  return session.environment_id ?? null;
};
