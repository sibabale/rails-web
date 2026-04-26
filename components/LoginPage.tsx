import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from './marketing/atoms/Button';
import { Container } from './marketing/atoms/Container';
import { Heading } from './marketing/atoms/Heading';
import { Text } from './marketing/atoms/Text';
import {
  AUTH_ERROR_BOX,
  AUTH_FOOTER_MICRO,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK_BACK,
  AUTH_REGISTER_LINK,
} from './marketing/marketingAuthUi';
import { getClientServerUrl } from '../lib/env';

interface LoginPageProps {
  onSuccess: (sessionData: any) => void;
  onForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onForgotPassword }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear password field when component unmounts (security measure)
  useEffect(() => {
    return () => {
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      if (passwordTimeoutRef.current) {
        clearTimeout(passwordTimeoutRef.current);
      }
      setFormData(prev => ({ ...prev, password: '' }));
    };
  }, []);

  // Clear password after 5 minutes of inactivity (security measure)
  useEffect(() => {
    if (formData.password) {
      // Clear any existing timeout
      if (passwordTimeoutRef.current) {
        clearTimeout(passwordTimeoutRef.current);
      }
      
      // Set new timeout to clear password after 5 minutes
      passwordTimeoutRef.current = setTimeout(() => {
        setFormData(prev => ({ ...prev, password: '' }));
        if (passwordInputRef.current) {
          passwordInputRef.current.value = '';
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (passwordTimeoutRef.current) {
        clearTimeout(passwordTimeoutRef.current);
      }
    };
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const CLIENT_SERVER_URL = getClientServerUrl() || '';
    
    if (!CLIENT_SERVER_URL) {
      setError('NEXT_PUBLIC_CLIENT_SERVER is not configured. All API calls must go through rails-client-server.');
      setLoading(false);
      return;
    }
    
    const endpoint = `${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/auth/login`;

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
        if (response.status === 401) {
          throw new Error("Invalid credentials. Please verify your email and password.");
        }
        
        let errorMessage = 'Authentication failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonErr) {
          // Log the actual error for debugging
          console.error('Login error response (not shown to user):', await response.text());
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // SECURITY: Clear password immediately after successful login
      // This prevents password from remaining in DOM after authentication
      setFormData(prev => ({ ...prev, password: '' }));
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
      
      onSuccess(data);
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Unable to connect to the service. Please check your connection and try again.');
      } else {
        // Use the error message from the API (should be user-friendly now)
        setError(err.message || 'Authentication failed. Please try again.');
      }
      // Clear password on error as well for security
      setFormData(prev => ({ ...prev, password: '' }));
      if (passwordInputRef.current) {
        passwordInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-h-[70vh] flex flex-col justify-center items-center py-16 !border-0 px-4 w-full">
      <div className="w-full max-w-sm mx-auto">
        <Link href="/" data-testid="login-back-home" className={AUTH_LINK_BACK}>
          <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
            arrow_back
          </span>
          <span>Back to landing</span>
        </Link>

        <div className="mb-10 flex flex-col items-center text-center">
          <Heading level={2} className="!text-3xl mb-2">
            Infrastructure <span className="text-zinc-400 dark:text-zinc-500">Auth</span>
          </Heading>
          <Text variant="p" className="!text-sm">
            Authenticate to your business node. Access restricted to institutional partners.
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className={AUTH_LABEL}>
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className={AUTH_INPUT}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className={AUTH_LABEL}>
              Password
            </label>
            <input
              id="login-password"
              ref={passwordInputRef}
              type="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              className={AUTH_INPUT}
            />
          </div>

          {error && (
            <div className={AUTH_ERROR_BOX} data-testid="login-error">
              <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }}>
                lock_reset
              </span>
              <div className="flex-1 text-left">
                <p className="font-mono font-semibold mb-1 uppercase tracking-wide text-[10px]">Auth failure</p>
                <p className="leading-relaxed opacity-90">{error}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3.5 mt-2 flex justify-center items-center gap-2 disabled:opacity-60"
            data-testid="login-submit"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm">Authenticating…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-sharp" style={{ fontSize: '1.25rem' }}>
                  key
                </span>
              </>
            )}
          </Button>

          <div className={AUTH_FOOTER_MICRO}>
            <button
              type="button"
              onClick={onForgotPassword}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Forgot security credentials?
            </button>
            <span className="text-zinc-400 dark:text-zinc-600">Secure session • TLS 1.3 enforced</span>
            <Link href="/register" data-testid="login-go-register" className={AUTH_REGISTER_LINK}>
              Register for a new institutional account
            </Link>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default LoginPage;
