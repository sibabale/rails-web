import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button/Button';
import { Container } from '@/components/atoms/Container/Container';
import { Heading } from '@/components/atoms/Heading/Heading';
import { Text } from '@/components/atoms/Text/Text';
import {
  AUTH_ERROR_BOX,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK_BACK,
  AUTH_SUCCESS_BOX,
} from '../marketing/marketingAuthUi';
import { passwordResetApi } from '../../lib/api';

interface ForgotPasswordPageProps {
  onSuccess: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await passwordResetApi.request(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="min-h-[70vh] flex flex-col justify-center items-center py-16 !border-0 px-4 w-full">
        <div className="w-full max-w-sm mx-auto text-center">
          <Link href="/login" className={AUTH_LINK_BACK}>
            <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
              arrow_back
            </span>
            <span>Back to login</span>
          </Link>

          <div className={AUTH_SUCCESS_BOX}>
            <div className="mb-6 flex justify-center">
              <span className="material-symbols-sharp text-emerald-600 dark:text-emerald-400" style={{ fontSize: '3rem' }}>
                check_circle
              </span>
            </div>
            <Heading level={2} className="!text-3xl mb-4">
              Check your email
            </Heading>
            <Text variant="p" className="!text-sm mb-6">
              If an account exists with that email, a password reset link has been sent.
            </Text>
            <Text variant="micro" className="!text-zinc-500">
              The link will expire in 1 hour.
            </Text>
            <div className="mt-8">
              <Button type="button" variant="secondary" className="px-6" onClick={() => onSuccess()}>
                Return to sign in
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="min-h-[70vh] flex flex-col justify-center items-center py-16 !border-0 px-4 w-full">
      <div className="w-full max-w-sm mx-auto">
        <Link href="/login" className={AUTH_LINK_BACK}>
          <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
            arrow_back
          </span>
          <span>Back to login</span>
        </Link>

        <div className="mb-10 flex flex-col items-center text-center">
          <Heading level={2} className="!text-3xl mb-2">
            Reset password
          </Heading>
          <Text variant="p" className="!text-sm">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="forgot-email" className={AUTH_LABEL}>
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={AUTH_INPUT}
            />
          </div>

          {error && (
            <div className={AUTH_ERROR_BOX} data-testid="forgot-error">
              <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }}>
                error
              </span>
              <div className="flex-1 text-left">
                <p className="font-mono font-semibold mb-1 text-[10px] uppercase tracking-wide">Error</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3.5 flex justify-center items-center gap-2 disabled:opacity-60"
            data-testid="forgot-submit"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm">Sending…</span>
              </>
            ) : (
              <>
                <span>Send reset link</span>
                <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
                  send
                </span>
              </>
            )}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;
