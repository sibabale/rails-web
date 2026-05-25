import React, { useState, useEffect, useRef } from 'react';
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
import { getClientServerUrl } from '../../lib/env';
import type { AuthSuccessResponse } from '../../lib/authSession';

interface RegisterFormData {
  name: string;
  website: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_password: string;
}

interface RegisterPageProps {
  isCheckingSession?: boolean;
  onSuccess: (data: AuthSuccessResponse) => void | Promise<void>;
}

interface RegisterFieldConfig {
  id: string;
  name: keyof RegisterFormData;
  label: React.ReactNode;
  type: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
}

interface RegistrationSubmitError extends Error {
  status?: number;
}

interface RegisterSubmitStatus {
  title: string | null;
  message: string;
}

const initialFormData: RegisterFormData = {
  name: '',
  website: '',
  admin_first_name: '',
  admin_last_name: '',
  admin_email: '',
  admin_password: '',
};

const businessFields: RegisterFieldConfig[] = [
  {
    id: 'reg-name',
    name: 'name',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Acme Institutional',
    required: true,
  },
  {
    id: 'reg-website',
    name: 'website',
    label: (
      <>
        Website <span className="text-zinc-400 dark:text-zinc-600 font-normal">(Optional)</span>
      </>
    ),
    type: 'url',
    placeholder: 'https://acme.com',
  },
];

const adminNameFields: RegisterFieldConfig[] = [
  {
    id: 'reg-fn',
    name: 'admin_first_name',
    label: 'Admin First Name',
    type: 'text',
    placeholder: 'Alice',
    required: true,
  },
  {
    id: 'reg-ln',
    name: 'admin_last_name',
    label: 'Admin Last Name',
    type: 'text',
    placeholder: 'Admin',
    required: true,
  },
];

const adminCredentialFields: RegisterFieldConfig[] = [
  {
    id: 'reg-email',
    name: 'admin_email',
    label: 'Admin Email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'admin@acme.com',
    required: true,
  },
  {
    id: 'reg-password',
    name: 'admin_password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
    placeholder: '••••••••••••',
    required: true,
  },
];

const getRegistrationEndpoint = () => {
  const clientServerUrl = getClientServerUrl();
  if (!clientServerUrl) {
    throw new Error('NEXT_PUBLIC_CLIENT_SERVER is not configured. All API calls must go through rails-client-server.');
  }
  return `${clientServerUrl.replace(/\/$/, '')}/api/v1/business/register`;
};

const createRegistrationError = (message: string, status?: number): RegistrationSubmitError => {
  const error = new Error(message) as RegistrationSubmitError;
  error.status = status;
  return error;
};

const getRegistrationError = async (response: Response) => {
  const fallbackMessage = 'Registration failed. Please try again.';
  const responseForLogging = response.clone();
  try {
    const errorData = (await response.json()) as Partial<{ message: string; error: string; status: number }>;
    return createRegistrationError(errorData.message || errorData.error || fallbackMessage, errorData.status);
  } catch {
    console.error('Registration error response (not shown to user):', await responseForLogging.text());
    return createRegistrationError(fallbackMessage);
  }
};

const submitRegistration = async (formData: RegisterFormData): Promise<AuthSuccessResponse> => {
  const response = await fetch(getRegistrationEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw await getRegistrationError(response);
  }

  return (await response.json()) as AuthSuccessResponse;
};

const registrationFallbackError: RegisterSubmitStatus = {
  title: null,
  message: 'An error occurred during registration. Please try again.',
};

const registrationFetchError: RegisterSubmitStatus = {
  title: null,
  message: 'Unable to connect to the service. Please check your connection and try again.',
};

const isFetchFailure = (error: unknown) => error instanceof TypeError && error.message === 'Failed to fetch';

const getRegistrationErrorStatusCode = (error: Error) => {
  const status = 'status' in error ? error.status : undefined;
  return typeof status === 'number' ? status : undefined;
};

const getRegistrationErrorStatus = (error: Error): RegisterSubmitStatus => ({
  title: getRegistrationErrorStatusCode(error) === 409 ? 'Email already in use' : null,
  message: error.message || registrationFallbackError.message,
});

const registrationErrorResolvers = [
  {
    matches: isFetchFailure,
    status: () => registrationFetchError,
  },
  {
    matches: (error: unknown) => error instanceof Error,
    status: (error: unknown) => getRegistrationErrorStatus(error as Error),
  },
];

const getRegistrationSubmitError = (error: unknown): RegisterSubmitStatus =>
  registrationErrorResolvers.find((resolver) => resolver.matches(error))?.status(error) ?? registrationFallbackError;

interface RegisterSubmitRunnerOptions {
  formData: RegisterFormData;
  onSuccess: (data: AuthSuccessResponse) => void | Promise<void>;
  clearPassword: () => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorTitle: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const finishRegisterSubmit = (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  shouldNavigate: boolean
) => {
  if (!shouldNavigate) {
    setLoading(false);
  }
};

const completeRegisterSubmit = async (data: AuthSuccessResponse, options: RegisterSubmitRunnerOptions) => {
  options.clearPassword();
  await options.onSuccess(data);
  return true;
};

const failRegisterSubmit = (error: unknown, options: RegisterSubmitRunnerOptions) => {
  console.error('Registration Error:', error);
  const submitError = getRegistrationSubmitError(error);
  options.setError(submitError.message);
  options.setErrorTitle(submitError.title);
  options.clearPassword();
  return false;
};

const runRegisterSubmit = async (options: RegisterSubmitRunnerOptions) => {
  options.setLoading(true);
  options.setError(null);
  options.setErrorTitle(null);

  const shouldNavigate = await submitRegistration(options.formData)
    .then((data) => completeRegisterSubmit(data, options))
    .catch((error: unknown) => failRegisterSubmit(error, options));

  finishRegisterSubmit(options.setLoading, shouldNavigate);
};

const RegisterSessionCheck = () => (
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
);

const RegisterBackLink = () => (
  <Link href="/" data-testid="register-back-home" className={AUTH_LINK_BACK}>
    <span className="material-symbols-sharp" style={{ fontSize: '1rem' }}>
      arrow_back
    </span>
    <span>Back to landing</span>
  </Link>
);

interface RegisterFieldProps {
  field: RegisterFieldConfig;
  value: string;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

const RegisterField = ({ field, value, disabled, onChange, inputRef }: RegisterFieldProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={field.id} className={AUTH_LABEL}>
      {field.label}
    </label>
    <input
      id={field.id}
      ref={inputRef}
      type={field.type}
      name={field.name}
      autoComplete={field.autoComplete}
      required={field.required}
      disabled={disabled}
      placeholder={field.placeholder}
      value={value}
      onChange={onChange}
      className={AUTH_INPUT}
    />
  </div>
);

interface RegisterFieldGroupProps {
  fields: RegisterFieldConfig[];
  formData: RegisterFormData;
  isBusy: boolean;
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  passwordInputRef: React.RefObject<HTMLInputElement | null>;
}

const RegisterFieldGroup = ({
  fields,
  formData,
  isBusy,
  className = 'grid grid-cols-1 md:grid-cols-2 gap-6',
  onChange,
  passwordInputRef,
}: RegisterFieldGroupProps) => (
  <div className={className}>
    {fields.map((field) => (
      <RegisterField
        key={field.name}
        field={field}
        value={formData[field.name]}
        disabled={isBusy}
        onChange={onChange}
        inputRef={field.name === 'admin_password' ? passwordInputRef : undefined}
      />
    ))}
  </div>
);

const RegisterError = ({ error, title }: { error: string | null; title: string | null }) => {
  if (!error) return null;

  return (
    <div className={AUTH_ERROR_BOX} data-testid="register-error">
      <span className="material-symbols-sharp shrink-0" style={{ fontSize: '1rem' }}>
        error
      </span>
      <div className="flex-1 text-left">
        <p className="font-mono font-semibold mb-1 text-[10px] uppercase tracking-wide">
          {title ?? 'Infrastructure error'}
        </p>
        <p className="leading-relaxed">{error}</p>
      </div>
    </div>
  );
};

const RegisterSubmitButton = ({ isBusy }: { isBusy: boolean }) => (
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
);

const RegisterFooter = () => (
  <div className="mt-10 flex flex-col items-center gap-4 text-[10px] font-mono text-zinc-500 tracking-widest uppercase text-center">
    <span className="text-zinc-500 dark:text-zinc-600">
      By registering, you agree to the rails institutional terms of service.
    </span>
    <Link
      href="/login"
      data-testid="register-go-login"
      className="mt-4 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-dotted border-zinc-400 dark:border-zinc-700 pb-0.5"
    >
      Already have an account? Sign in
    </Link>
  </div>
);

interface RegisterFormProps {
  formData: RegisterFormData;
  isBusy: boolean;
  error: string | null;
  errorTitle: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  passwordInputRef: React.RefObject<HTMLInputElement | null>;
}

const RegisterForm = ({
  formData,
  isBusy,
  error,
  errorTitle,
  onChange,
  onSubmit,
  passwordInputRef,
}: RegisterFormProps) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-6">
    <RegisterFieldGroup
      fields={businessFields}
      formData={formData}
      isBusy={isBusy}
      onChange={onChange}
      passwordInputRef={passwordInputRef}
    />
    <RegisterFieldGroup
      fields={adminNameFields}
      formData={formData}
      isBusy={isBusy}
      onChange={onChange}
      passwordInputRef={passwordInputRef}
    />
    <RegisterFieldGroup
      fields={adminCredentialFields}
      formData={formData}
      isBusy={isBusy}
      className="grid grid-cols-1 gap-6"
      onChange={onChange}
      passwordInputRef={passwordInputRef}
    />
    <RegisterError error={error} title={errorTitle} />
    <RegisterSubmitButton isBusy={isBusy} />
    <RegisterFooter />
  </form>
);

const RegisterReadyContent = ({
  formData,
  isBusy,
  error,
  errorTitle,
  onChange,
  onSubmit,
  passwordInputRef,
}: RegisterFormProps) => (
  <>
    <RegisterBackLink />
    <RegisterForm
      formData={formData}
      isBusy={isBusy}
      error={error}
      errorTitle={errorTitle}
      onChange={onChange}
      onSubmit={onSubmit}
      passwordInputRef={passwordInputRef}
    />
  </>
);

interface RegisterPageContentProps extends RegisterFormProps {
  isCheckingSession: boolean;
}

const RegisterPageContent = ({ isCheckingSession, ...formProps }: RegisterPageContentProps) => (
  <div className="w-full max-w-2xl mx-auto">
    {isCheckingSession ? <RegisterSessionCheck /> : <RegisterReadyContent {...formProps} />}
  </div>
);

const RegisterPage: React.FC<RegisterPageProps> = ({ isCheckingSession = false, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);

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

  const clearPassword = () => {
    setFormData(prev => ({ ...prev, admin_password: '' }));
    if (passwordInputRef.current) {
      passwordInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckingSession) return;
    await runRegisterSubmit({ formData, onSuccess, clearPassword, setError, setErrorTitle, setLoading });
  };

  const isBusy = loading || isCheckingSession;

  return (
    <Container className="min-h-[70vh] flex flex-col py-16 !border-0 px-4 w-full">
      <RegisterPageContent
        isCheckingSession={isCheckingSession}
        formData={formData}
        isBusy={isBusy}
        error={error}
        errorTitle={errorTitle}
        onChange={handleChange}
        onSubmit={handleSubmit}
        passwordInputRef={passwordInputRef}
      />
    </Container>
  );
};

export default RegisterPage;
