import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from './marketing/atoms/Button/Button';
import { Container } from './marketing/atoms/Container/Container';
import { Heading } from './marketing/atoms/Heading/Heading';
import { Text } from './marketing/atoms/Text/Text';
import {
  AUTH_ERROR_BOX,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK_BACK,
  AUTH_SUCCESS_BOX,
} from './marketing/marketingAuthUi';
import { passwordResetApi } from '../lib/api';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  initialToken?: string | null;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess, initialToken }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [token, setToken] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tokenParam = initialToken;
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [initialToken]);

  useEffect(() => {
    return () => {
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      if (confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.value = '';
      }
      setFormData({ password: '', confirmPassword: '' });
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await passwordResetApi.reset(token, formData.password);

      setFormData({ password: '', confirmPassword: '' });
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      if (confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.value = '';
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired. Please request a new one.');
      setFormData({ password: '', confirmPassword: '' });
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      if (confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="min-h-[70vh] flex flex-col justify-center items-center py-16 !border-0 px-4 w-full">
        <div className="w-full max-w-sm mx-auto text-center">
          <div className={AUTH_SUCCESS_BOX} data-testid="reset-success">
            <div className="mb-6 flex justify-center">
              <span className="material-symbols-sharp text-emerald-600 dark:text-emerald-400" style={{ fontSize: '3rem' }}>
                check_circle
              </span>
            </div>
            <Heading level={2} className="!text-3xl mb-4">
              Password reset successful
            </Heading>
            <Text variant="p" className="!text-sm mb-4">
              Your password has been reset. You can now sign in with your new password.
            </Text>
            <Text variant="micro" className="!text-zinc-500">
              Redirecting to login…
            </Text>
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
            Set new password
          </Heading>
          <Text variant="p" className="!text-sm">
            Enter your new password below.
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="reset-password" className={AUTH_LABEL}>
              New password
            </label>
            <input
              id="reset-password"
              ref={passwordInputRef}
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              className={AUTH_INPUT}
            />
            <span className="text-[10px] font-mono text-zinc-500">Must be at least 8 characters</span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reset-confirm" className={AUTH_LABEL}>
              Confirm password
            </label>
            <input
              id="reset-confirm"
              ref={confirmPasswordInputRef}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={AUTH_INPUT}
            />
          </div>

          {error && (
            <div className={AUTH_ERROR_BOX} data-testid="reset-error">
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
            disabled={loading || !token}
            className="w-full py-3.5 flex justify-center items-center gap-2 disabled:opacity-60"
            data-testid="reset-submit"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm">Resetting…</span>
              </>
            ) : (
              <>
                <span>Reset password</span>
                <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
                  lock_reset
                </span>
              </>
            )}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default ResetPasswordPage;
