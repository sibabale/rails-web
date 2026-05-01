/**
 * Read public env vars with **static** `process.env.KEY` access only.
 * Next/Webpack/Turbopack inlines `NEXT_PUBLIC_*` at compile time; dynamic
 * `process.env[variable]` is never replaced and is always undefined in the browser.
 */
const nonEmpty = (value: string | undefined): value is string =>
  typeof value === 'string' && value.length > 0;

export const getClientServerUrl = (): string | undefined => {
  if (nonEmpty(process.env.NEXT_PUBLIC_CLIENT_SERVER)) return process.env.NEXT_PUBLIC_CLIENT_SERVER;
  return undefined;
};

export const isAuthViewsEnabled = (): boolean => {
  if (nonEmpty(process.env.NEXT_PUBLIC_ENABLE_AUTH_VIEWS))
    return process.env.NEXT_PUBLIC_ENABLE_AUTH_VIEWS === 'true';
  return false;
};

export const isAuthButtonsEnabled = (): boolean => {
  if (nonEmpty(process.env.NEXT_PUBLIC_SHOW_AUTH_BUTTONS))
    return process.env.NEXT_PUBLIC_SHOW_AUTH_BUTTONS === 'true';
  return false;
};

/** Public docs URL for marketing CTAs; falls back to infrastructure overview. */
export const getMarketingDocsHref = (): string => {
  if (nonEmpty(process.env.NEXT_PUBLIC_DOCS_URL)) return process.env.NEXT_PUBLIC_DOCS_URL;
  return '/infrastructure';
};

export const isAnalyticsExplicitlyDisabled = (): boolean => {
  if (nonEmpty(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS))
    return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'false';
  return false;
};

export const getPostHogKeyEnv = (): string | undefined => {
  if (nonEmpty(process.env.NEXT_PUBLIC_POSTHOG_KEY)) return process.env.NEXT_PUBLIC_POSTHOG_KEY;
  return undefined;
};

export const getPostHogHostEnv = (): string | undefined => {
  if (nonEmpty(process.env.NEXT_PUBLIC_POSTHOG_HOST)) return process.env.NEXT_PUBLIC_POSTHOG_HOST;
  return undefined;
};

