'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthViewsEnabled } from '../../lib/env';
import ResetPasswordPage from '../../components/ResetPasswordPage';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authEnabled = isAuthViewsEnabled();

  useEffect(() => {
    if (!authEnabled) router.replace('/');
  }, [authEnabled, router]);

  if (!authEnabled) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <ResetPasswordPage
        initialToken={searchParams.get('token')}
        onBack={() => router.push('/login')}
        onSuccess={() => router.push('/login')}
      />
    </div>
  );
}
