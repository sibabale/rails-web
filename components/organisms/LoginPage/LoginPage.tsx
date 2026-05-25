import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button/Button';
import { Container } from '@/components/atoms/Container/Container';
import { Heading } from '@/components/atoms/Heading/Heading';
import { Text } from '@/components/atoms/Text/Text';
import {
  AUTH_ERROR_BOX,
  AUTH_FOOTER_MICRO,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK_BACK,
  AUTH_REGISTER_LINK,
} from '@/components/marketing/marketingAuthUi';
import { getClientServerUrl } from '@/lib/env';
import type { AuthSuccessResponse } from '@/lib/authSession';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginPageProps {
  isCheckingSession?: boolean;
  onSuccess: (sessionData: AuthSuccessResponse) => void | Promise<void>;
  onForgotPassword: () => void;
}

const getLoginEndpoint = () => {
  const clientServerUrl = getClientServerUrl();
  if (!clientServerUrl) {
    throw new Error('NEXT_PUBLIC_CLIENT_SERVER is not configured. All API calls must go through rails-client-server.');
  }
  return `${clientServerUrl.replace(/\/$/, '')}/api/v1/auth/login`;
};

const getLoginErrorMessage = async (response: Response) => {
  if (response.status === 401) {
    return 'Invalid credentials. Please verify your email and password.';
  }

  const fallbackMessage = 'Authentication failed. Please try again.';
  const responseForLogging = response.clone();
  try {
    const errorData = (await response.json()) as Partial<{ message: string; error: string }>;
    return errorData.message || errorData.error || fallbackMessage;
  } catch {
    console.error('Login error response (not shown to user):', await responseForLogging.text());
    return fallbackMessage;
  }
};

const submitLogin = async (formData: LoginFormData): Promise<AuthSuccessResponse> => {
  const response = await fetch(getLoginEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(await getLoginErrorMessage(response));
  }

  return (await response.json()) as AuthSuccessResponse;
};

const getSubmitErrorMessage = (error: unknown) => {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Unable to connect to the service. Please check your connection and try again.';
  }
  if (error instanceof Error) {
    return error.message || 'Authentication failed. Please try again.';
  }
  return 'Authentication failed. Please try again.';
};

interface LoginSubmitRunnerOptions {
  formData: LoginFormData;
  onSuccess: (sessionData: AuthSuccessResponse) => void | Promise<void>;
  clearPassword: () => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const finishLoginSubmit = (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  shouldKeepLoading: boolean
) => {
  if (!shouldKeepLoading) {
    setLoading(false);
  }
};

const completeLoginSubmit = async (data: AuthSuccessResponse, options: LoginSubmitRunnerOptions) => {
  options.clearPassword();
  await options.onSuccess(data);
  return true;
};

const failLoginSubmit = (error: unknown, options: LoginSubmitRunnerOptions) => {
  console.error('Login Error:', error);
  options.setError(getSubmitErrorMessage(error));
  options.clearPassword();
  return false;
};

const runLoginSubmit = async (options: LoginSubmitRunnerOptions) => {
  options.setLoading(true);
  options.setError(null);

  const shouldKeepLoading = await submitLogin(options.formData)
    .then((data) => completeLoginSubmit(data, options))
    .catch((error: unknown) => failLoginSubmit(error, options));

  finishLoginSubmit(options.setLoading, shouldKeepLoading);
};

const LoginPage: React.FC<LoginPageProps> = ({ isCheckingSession = false, onSuccess, onForgotPassword }) => {
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

  const clearPassword = () => {
    setFormData(prev => ({ ...prev, password: '' }));
    if (passwordInputRef.current) {
      passwordInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckingSession) return;
    await runLoginSubmit({ formData, onSuccess, clearPassword, setError, setLoading });
  };

  const isBusy = loading || isCheckingSession;

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
              disabled={isBusy}
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
              disabled={isBusy}
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
            disabled={isBusy}
            className="w-full py-3.5 mt-2 flex justify-center items-center gap-2 disabled:opacity-60"
            data-testid="login-submit"
          >
            {isBusy ? (
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
              disabled={isBusy}
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
