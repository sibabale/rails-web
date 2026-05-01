'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../state/hooks';
import { setEnvironment } from '../../state/slices/environmentSlice';
import { isAuthViewsEnabled } from '../../lib/env';
import LoginPage from '../../components/LoginPage';

interface EnvironmentInfo {
  id: string;
  type: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  timestamp: number;
  environment_id: string;
  environments: EnvironmentInfo[];
}

export default function LoginRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authEnabled = isAuthViewsEnabled();

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

  const handleAuthSuccess = (data: any) => {
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

    const sessionData: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      timestamp: Date.now(),
      environment_id: envId,
      environments,
    };

    localStorage.setItem('rails_session', JSON.stringify(sessionData));
    document.cookie = 'rails_session_present=1; Path=/; SameSite=Lax';
    router.push('/dashboard');
  };

  return <LoginPage onSuccess={handleAuthSuccess} onForgotPassword={() => router.push('/forgot-password')} />;
}
