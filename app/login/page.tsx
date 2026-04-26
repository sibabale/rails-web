'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!authEnabled) router.replace('/');
  }, [authEnabled, router]);

  if (!authEnabled) return null;

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

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <LoginPage
        onBack={() => router.push('/')}
        onSuccess={handleAuthSuccess}
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </div>
  );
}
