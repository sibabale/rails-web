import type { NextConfig } from 'next';

/** Prefer NEXT_PUBLIC_*; fall back to VITE_* from legacy .env files. Coalesce at config load so Turbopack inlines a single value into the client bundle. */
const firstNonEmpty = (...values: (string | undefined)[]): string | undefined => {
  for (const v of values) {
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
};

const coalescedPublicEnv = (): Record<string, string> => {
  const out: Record<string, string> = {};
  const set = (key: string, value: string | undefined) => {
    if (value != null && value.length > 0) out[key] = value;
  };
  set(
    'NEXT_PUBLIC_CLIENT_SERVER',
    firstNonEmpty(process.env.NEXT_PUBLIC_CLIENT_SERVER, process.env.VITE_CLIENT_SERVER)
  );
  set('NEXT_PUBLIC_SITE_URL', firstNonEmpty(process.env.NEXT_PUBLIC_SITE_URL, process.env.VITE_SITE_URL));
  set(
    'NEXT_PUBLIC_ENABLE_AUTH_VIEWS',
    firstNonEmpty(process.env.NEXT_PUBLIC_ENABLE_AUTH_VIEWS, process.env.VITE_ENABLE_AUTH_VIEWS)
  );
  set(
    'NEXT_PUBLIC_SHOW_AUTH_BUTTONS',
    firstNonEmpty(process.env.NEXT_PUBLIC_SHOW_AUTH_BUTTONS, process.env.VITE_SHOW_AUTH_BUTTONS)
  );
  set(
    'NEXT_PUBLIC_ENABLE_ANALYTICS',
    firstNonEmpty(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, process.env.VITE_ENABLE_ANALYTICS)
  );
  return out;
};

const _e2ePublicEnv = coalescedPublicEnv();

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  reactStrictMode: true,
  output: 'standalone',
  // Playwright (and other tools) may open the dev server from 127.0.0.1 while Turbopack
  // serves assets from localhost; allow both so the client bundle loads during E2E.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  env: _e2ePublicEnv,
};

export default nextConfig;
