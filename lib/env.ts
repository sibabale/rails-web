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

/** When false, `/login`, `/register`, `/forgot-password`, and `/reset-password` render the disabled notice instead of real forms. */
export const isAuthViewsEnabled = (): boolean => {
  if (nonEmpty(process.env.NEXT_PUBLIC_ENABLE_AUTH_VIEWS))
    return process.env.NEXT_PUBLIC_ENABLE_AUTH_VIEWS === 'true';
  return false;
};

/**
 * When true, show every **Get Started** / auth entry CTA (marketing header, hero, bottom CTA, auth shell header, legacy `Navbar`).
 * **Read Documentation** / Read Docs use **primary** (filled) when Get Started is hidden, and **secondary** (outline) when both show.
 * Does not enable auth forms by itself—pair with `isAuthViewsEnabled()` for end-to-end sign-up flows.
 */
export const isAuthButtonsEnabled = (): boolean => {
  if (nonEmpty(process.env.NEXT_PUBLIC_SHOW_AUTH_BUTTONS))
    return process.env.NEXT_PUBLIC_SHOW_AUTH_BUTTONS === 'true';
  return false;
};

/**
 * Public documentation URL for marketing CTAs (`Read Documentation`, `Read Docs`) and the header nav **Documentation** link.
 * Set `NEXT_PUBLIC_DOCS_URL` in each environment (e.g. `https://docs.example.com`). When unset, fall back to
 * an internal docs route so we do not redirect docs CTAs to unrelated external destinations.
 */
const MARKETING_DOCS_CTA_FALLBACK = '/docs';

export const getMarketingDocsCtaUrl = (): string => {
  if (nonEmpty(process.env.NEXT_PUBLIC_DOCS_URL)) return process.env.NEXT_PUBLIC_DOCS_URL.trim();
  return MARKETING_DOCS_CTA_FALLBACK;
};

/** @alias {@link getMarketingDocsCtaUrl} */
export const getMarketingDocsHref = (): string => getMarketingDocsCtaUrl();

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

/** Multivariate flag key in PostHog (variants `a` and `d`). Must match the flag created in PostHog. */
export const getPostHogMarketingCopyFlagKey = (): string => {
  if (nonEmpty(process.env.NEXT_PUBLIC_POSTHOG_MARKETING_COPY_FLAG_KEY))
    return process.env.NEXT_PUBLIC_POSTHOG_MARKETING_COPY_FLAG_KEY;
  return 'marketing_site_copy';
};

/** Default marketing copy variant when no session assignment and flags are unavailable. */
export const getDefaultMarketingCopyVariant = (): 'a' | 'd' => {
  if (process.env.NEXT_PUBLIC_MARKETING_COPY_VARIANT === 'd') return 'd';
  return 'a';
};
