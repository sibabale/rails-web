'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../state/hooks';
import { setEnvironment } from '../../state/slices/environmentSlice';
import { isAuthViewsEnabled } from '../../lib/env';
import {
  RAILS_SESSION_STORAGE_KEY,
  getSessionEnvironmentType,
  readValidRailsSession,
  writeRailsSessionCookie,
} from '../../lib/authSession';
import type { RailsSession } from '../../lib/authSession';
import RegisterPage from '../../components/RegisterPage';

interface EnvironmentInfo {
  id: string;
  type: string;
}

export default function RegisterRoute() {
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
        <h1 className="text-lg font-semibold text-black dark:text-white mb-3">Registration unavailable</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          Authentication is turned off in this deployment. Set{' '}
          <code className="font-mono text-xs text-black dark:text-white">NEXT_PUBLIC_ENABLE_AUTH_VIEWS=true</code> in
          your environment to enable login and registration.
        </p>
        <Link href="/" className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const handleAuthSuccess = async (data: any) => {
    const envId =
      data.selected_environment_id ||
      data.environment?.id ||
      data.user?.environment_id ||
      data.environment_id;

    if (!envId) return;

    const environments: EnvironmentInfo[] = data.environments || [];
    const selectedEnv = environments.find((e) => e.id === envId);
    const environmentType = (selectedEnv?.type || 'sandbox') as 'sandbox' | 'production';
    dispatch(setEnvironment(environmentType));

    const sessionData: RailsSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      timestamp: Date.now(),
      environment_id: envId,
      environments,
    };

    localStorage.setItem(RAILS_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    writeRailsSessionCookie();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    router.replace('/dashboard');
  };

  return <RegisterPage isCheckingSession={isCheckingSession} onSuccess={handleAuthSuccess} />;
}
