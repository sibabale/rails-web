import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BetaSignup from '../components/BetaSignup';
import { betaApplyApi } from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    betaApplyApi: {
      apply: vi.fn(),
    },
  };
});

describe('BetaSignup', () => {
  const applyMock = vi.mocked(betaApplyApi.apply);

  beforeEach(() => {
    applyMock.mockReset();
  });

  const getFormFields = () => ({
    name: screen.getByPlaceholderText('John Doe'),
    company: screen.getByPlaceholderText('Acme Inc'),
    email: screen.getByPlaceholderText('john@acme.com'),
    useCase: screen.getByPlaceholderText(/Tell us about the banking rails/),
    submit: screen.getByRole('button', { name: /Submit Application/i }),
  });

  it('renders the form with heading and fields', () => {
    render(<BetaSignup />);
    expect(screen.getByRole('heading', { name: /Apply for the Private Beta/i })).toBeInTheDocument();
    const { name, company, email, useCase, submit } = getFormFields();
    expect(name).toBeInTheDocument();
    expect(company).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(useCase).toBeInTheDocument();
    expect(submit).toBeInTheDocument();
  });

  it('calls beta apply API on submit with trimmed payload', async () => {
    applyMock.mockResolvedValue({ message: 'Application received.' });
    const user = userEvent.setup();
    render(<BetaSignup />);
    const { name, company, email, useCase, submit } = getFormFields();

    await user.type(name, 'Jane Doe');
    await user.type(company, 'Acme Inc');
    await user.type(email, 'jane@acme.com');
    await user.type(useCase, 'Payments');
    await user.click(submit);

    await waitFor(() => {
      expect(applyMock).toHaveBeenCalledTimes(1);
      expect(applyMock).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@acme.com',
        company: 'Acme Inc',
        use_case: 'Payments',
      });
    });
  });

  it('shows success view after successful submit', async () => {
    applyMock.mockResolvedValue({ message: 'Application received.' });
    const user = userEvent.setup();
    render(<BetaSignup />);
    const { name, company, email, useCase, submit } = getFormFields();

    await user.type(name, 'Jane Doe');
    await user.type(company, 'Acme Inc');
    await user.type(email, 'jane@acme.com');
    await user.type(useCase, 'Payments');
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Application Encrypted & Sent/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Submit another application/i)).toBeInTheDocument();
  });

  it('shows error message and keeps form visible on API failure', async () => {
    applyMock.mockRejectedValue(new Error('All fields are required.'));
    const user = userEvent.setup();
    render(<BetaSignup />);
    const { name, company, email, useCase, submit } = getFormFields();

    await user.type(name, 'Jane');
    await user.type(company, 'Acme');
    await user.type(email, 'jane@acme.com');
    await user.type(useCase, 'Payments');
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('All fields are required.');
    });
    expect(screen.getByRole('button', { name: /Submit Application/i })).toBeInTheDocument();
  });

  it('shows friendly message for network / Failed to fetch errors', async () => {
    applyMock.mockRejectedValue(new Error('Failed to fetch'));
    const user = userEvent.setup();
    render(<BetaSignup />);
    const { name, company, email, useCase, submit } = getFormFields();

    await user.type(name, 'Jane');
    await user.type(company, 'Acme');
    await user.type(email, 'jane@acme.com');
    await user.type(useCase, 'Payments');
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Unable to reach the server. Please check your connection and try again.'
      );
    });
  });
});
