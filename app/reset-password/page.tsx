'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthViewsEnabled } from '../../lib/env';
import ResetPasswordPage from '../../components/ResetPasswordPage';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authEnabled = isAuthViewsEnabled();

  if (!authEnabled) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center" data-testid="auth-disabled-notice">
        <h1 className="text-lg font-semibold text-black dark:text-white mb-3">Password reset unavailable</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          Authentication is turned off in this deployment. Set{' '}
          <code className="font-mono text-xs text-black dark:text-white">NEXT_PUBLIC_ENABLE_AUTH_VIEWS=true</code> to
          enable auth flows.
        </p>
        <Link href="/" className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

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
