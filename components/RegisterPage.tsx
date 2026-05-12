import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from './marketing/atoms/Button';
import { Container } from './marketing/atoms/Container';
import { Heading } from './marketing/atoms/Heading';
import { Text } from './marketing/atoms/Text';
import {
  AUTH_ERROR_BOX,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK_BACK,
  AUTH_SUCCESS_BOX,
} from './marketing/marketingAuthUi';
import { getClientServerUrl } from '../lib/env';

interface RegisterPageProps {
  isCheckingSession?: boolean;
  onSuccess: (data: any) => void | Promise<void>;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ isCheckingSession = false, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: ''
  });

  // Clear password field when component unmounts (security measure)
  useEffect(() => {
    return () => {
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      setFormData(prev => ({ ...prev, admin_password: '' }));
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckingSession) return;
    setLoading(true);
    setError(null);
    setErrorTitle(null);
    let shouldNavigate = false;

    const CLIENT_SERVER_URL = getClientServerUrl() || '';
    
    if (!CLIENT_SERVER_URL) {
      setError('NEXT_PUBLIC_CLIENT_SERVER is not configured. All API calls must go through rails-client-server.');
      setLoading(false);
      return;
    }
    
    const endpoint = `${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/business/register`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed. Please try again.';
        let errorCode: string | undefined;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorCode = errorData.code;
        } catch (jsonErr) {
          // Log the actual error for debugging
          console.error('Registration error response (not shown to user):', await response.text());
        }
        throw { message: errorMessage, code: errorCode };
      }

      const data = await response.json();
      
      // SECURITY: Clear password immediately after successful registration
      setFormData(prev => ({ ...prev, admin_password: '' }));
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      
      shouldNavigate = true;
      await onSuccess(data);
    } catch (err: any) {
      console.error('Registration Error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Unable to connect to the service. Please check your connection and try again.');
      } else {
        const message = err?.message || 'An error occurred during registration. Please try again.';
        setError(message);
        setErrorTitle(err?.code === 'conflict' ? 'Email already in use' : null);
      }
      // Clear password on error as well for security
      setFormData(prev => ({ ...prev, admin_password: '' }));
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
    } finally {
      if (!shouldNavigate) {
        setLoading(false);
      }
    }
  };

  const isBusy = loading || isCheckingSession;

  return (
    <Container className="min-h-[70vh] flex flex-col py-16 !border-0 px-4 w-full">
      <div className="w-full max-w-2xl mx-auto">
        {isCheckingSession ? (
          <div className={AUTH_SUCCESS_BOX} data-testid="register-session-check">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <Heading level={3} className="!text-xl mb-2 text-emerald-800 dark:text-emerald-400">
              Initializing node
            </Heading>
            <Text variant="p" className="!text-sm text-emerald-700 dark:text-emerald-500/90">
              Preparing your dashboard…
            </Text>
          </div>
        ) : (
          <>
            <Link href="/" data-testid="register-back-home" className={AUTH_LINK_BACK}>
              <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
                arrow_back
              </span>
              <span>Back to landing</span>
            </Link>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-name" className={AUTH_LABEL}>
                  Company Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  required
                  disabled={isBusy}
                  placeholder="Acme Institutional"
                  value={formData.name}
                  onChange={handleChange}
                  className={AUTH_INPUT}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-website" className={AUTH_LABEL}>
                  Website <span className="text-zinc-400 dark:text-zinc-600 font-normal">(Optional)</span>
                </label>
                <input
                  id="reg-website"
                  type="url"
                  name="website"
                  disabled={isBusy}
                  placeholder="https://acme.com"
                  value={formData.website}
                  onChange={handleChange}
                  className={AUTH_INPUT}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-fn" className={AUTH_LABEL}>
                  Admin First Name
                </label>
                <input
                  id="reg-fn"
                  type="text"
                  name="admin_first_name"
                  required
                  disabled={isBusy}
                  placeholder="Alice"
                  value={formData.admin_first_name}
                  onChange={handleChange}
                  className={AUTH_INPUT}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-ln" className={AUTH_LABEL}>
                  Admin Last Name
                </label>
                <input
                  id="reg-ln"
                  type="text"
                  name="admin_last_name"
                  required
                  disabled={isBusy}
                  placeholder="Admin"
                  value={formData.admin_last_name}
                  onChange={handleChange}
                  className={AUTH_INPUT}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email" className={AUTH_LABEL}>
                Admin Email
              </label>
              <input
                id="reg-email"
                type="email"
                name="admin_email"
                autoComplete="email"
                required
                disabled={isBusy}
                placeholder="admin@acme.com"
                value={formData.admin_email}
                onChange={handleChange}
                className={AUTH_INPUT}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="reg-password" className={AUTH_LABEL}>
                Password
              </label>
              <input
                id="reg-password"
                ref={passwordInputRef}
                type="password"
                name="admin_password"
                autoComplete="new-password"
                required
                disabled={isBusy}
                placeholder="••••••••••••"
                value={formData.admin_password}
                onChange={handleChange}
                className={AUTH_INPUT}
              />
            </div>

            {error && (
              <div className={AUTH_ERROR_BOX} data-testid="register-error">
                <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }}>
                  error
                </span>
                <div className="flex-1 text-left">
                  <p className="font-mono font-semibold mb-1 text-[10px] uppercase tracking-wide">
                    {errorTitle ?? 'Infrastructure error'}
                  </p>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isBusy}
              className="w-full py-3.5 mt-2 flex justify-center items-center gap-2 disabled:opacity-60"
              data-testid="register-submit"
            >
              {isBusy ? (
                <>
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-sm">Initializing node…</span>
                </>
              ) : (
                <>
                  <span>Create My Account</span>
                  <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
                    arrow_forward
                  </span>
                </>
              )}
            </Button>

            <div className="mt-10 flex flex-col items-center gap-4 text-[10px] font-mono text-zinc-500 tracking-widest uppercase text-center">
              <span className="text-zinc-500 dark:text-zinc-600">
                By registering, you agree to the rails institutional terms of service.
              </span>
              <Link href="/login" data-testid="register-go-login" className="mt-4 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-dotted border-zinc-400 dark:border-zinc-700 pb-0.5">
                Already have an account? Sign in
              </Link>
            </div>
            </form>
          </>
        )}
      </div>
    </Container>
  );
};

export default RegisterPage;
