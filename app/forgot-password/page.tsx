'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthViewsEnabled } from '../../lib/env';
import ForgotPasswordPage from '../../components/ForgotPasswordPage';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const authEnabled = isAuthViewsEnabled();

  useEffect(() => {
    if (!authEnabled) router.replace('/');
  }, [authEnabled, router]);

  if (!authEnabled) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <ForgotPasswordPage onBack={() => router.push('/login')} onSuccess={() => router.push('/login')} />
    </div>
  );
}
