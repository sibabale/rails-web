'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../state/hooks';
import { setEnvironment } from '../../state/slices/environmentSlice';
import { isAuthViewsEnabled } from '../../lib/env';
import {
  RAILS_SESSION_STORAGE_KEY,
  buildRailsSession,
  getAuthSuccessEnvironmentId,
  getSessionEnvironmentType,
  readValidRailsSession,
  writeRailsSessionCookie,
} from '../../lib/authSession';
import type { AuthSuccessResponse } from '../../lib/authSession';
import LoginPage from '../../components/LoginPage';

export default function LoginRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authEnabled = isAuthViewsEnabled();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (!authEnabled) {
      setIsCheckingSession(false);
      return;
    }

    const existingSession = readValidRailsSession();
    if (!existingSession) {
      setIsCheckingSession(false);
      return;
    }

    writeRailsSessionCookie();
    dispatch(setEnvironment(getSessionEnvironmentType(existingSession)));
    router.replace('/dashboard');
  }, [authEnabled, dispatch, router]);

  if (!authEnabled) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center" data-testid="auth-disabled-notice">
        <h1 className="text-lg font-semibold text-black dark:text-white mb-3">Sign-in unavailable</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          Authentication is turned off in this deployment. Set{' '}
          <code className="font-mono text-xs text-black dark:text-white">NEXT_PUBLIC_ENABLE_AUTH_VIEWS=true</code> in
          your environment to enable login and registration.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const handleAuthSuccess = async (data: AuthSuccessResponse) => {
    const envId = getAuthSuccessEnvironmentId(data);

    if (!envId) return;

    const environments = data.environments || [];
    const selectedEnv = environments.find((e) => e.id === envId);
    const environmentType = (selectedEnv?.type || 'sandbox') as 'sandbox' | 'production';
    dispatch(setEnvironment(environmentType));

    localStorage.setItem(RAILS_SESSION_STORAGE_KEY, JSON.stringify(buildRailsSession(data, envId)));
    writeRailsSessionCookie();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    router.replace('/dashboard');
  };

  return (
    <LoginPage
      isCheckingSession={isCheckingSession}
      onSuccess={handleAuthSuccess}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
