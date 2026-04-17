const readFirstDefined = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
};

export const getClientServerUrl = (): string | undefined =>
  readFirstDefined('NEXT_PUBLIC_CLIENT_SERVER', 'VITE_CLIENT_SERVER');

export const isAuthViewsEnabled = (): boolean =>
  readFirstDefined('NEXT_PUBLIC_ENABLE_AUTH_VIEWS', 'VITE_ENABLE_AUTH_VIEWS') === 'true';

export const isAuthButtonsEnabled = (): boolean =>
  readFirstDefined('NEXT_PUBLIC_SHOW_AUTH_BUTTONS', 'VITE_SHOW_AUTH_BUTTONS') === 'true';

export const isAnalyticsExplicitlyDisabled = (): boolean =>
  readFirstDefined('NEXT_PUBLIC_ENABLE_ANALYTICS', 'VITE_ENABLE_ANALYTICS') === 'false';

export const getPostHogKeyEnv = (): string | undefined =>
  readFirstDefined(
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_VITE_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_VITE_POSTHOG_KEY',
    'VITE_PUBLIC_POSTHOG_KEY',
    'VITE_POSTHOG_KEY'
  );

export const getPostHogHostEnv = (): string | undefined =>
  readFirstDefined(
    'NEXT_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_VITE_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_VITE_POSTHOG_HOST',
    'VITE_PUBLIC_POSTHOG_HOST',
    'VITE_POSTHOG_HOST'
  );
