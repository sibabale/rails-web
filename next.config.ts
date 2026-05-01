import type { NextConfig } from 'next';

/** Inline non-empty `NEXT_PUBLIC_*` from the environment at config load (Turbopack/Webpack). */
const publicClientEnv = (): Record<string, string> => {
  const out: Record<string, string> = {};
  const set = (key: string, value: string | undefined) => {
    if (value != null && value.length > 0) out[key] = value;
  };
  set('NEXT_PUBLIC_CLIENT_SERVER', process.env.NEXT_PUBLIC_CLIENT_SERVER);
  set('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL);
  set('NEXT_PUBLIC_ENABLE_AUTH_VIEWS', process.env.NEXT_PUBLIC_ENABLE_AUTH_VIEWS);
  set('NEXT_PUBLIC_SHOW_AUTH_BUTTONS', process.env.NEXT_PUBLIC_SHOW_AUTH_BUTTONS);
  set('NEXT_PUBLIC_ENABLE_ANALYTICS', process.env.NEXT_PUBLIC_ENABLE_ANALYTICS);
  set('NEXT_PUBLIC_POSTHOG_KEY', process.env.NEXT_PUBLIC_POSTHOG_KEY);
  set('NEXT_PUBLIC_POSTHOG_HOST', process.env.NEXT_PUBLIC_POSTHOG_HOST);
  set(
    'NEXT_PUBLIC_POSTHOG_MARKETING_COPY_FLAG_KEY',
    process.env.NEXT_PUBLIC_POSTHOG_MARKETING_COPY_FLAG_KEY
  );
  set('NEXT_PUBLIC_SAMPLES_REPO_URL', process.env.NEXT_PUBLIC_SAMPLES_REPO_URL);
  set('NEXT_PUBLIC_DOCS_URL', process.env.NEXT_PUBLIC_DOCS_URL);
  return out;
};

const _e2ePublicEnv = publicClientEnv();

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  reactStrictMode: true,
  output: 'standalone',
  // Playwright (and other tools) may open the dev server from 127.0.0.1 while Turbopack
  // serves assets from localhost; allow both so the client bundle loads during E2E.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  env: _e2ePublicEnv,
};

export default nextConfig;
