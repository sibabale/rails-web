import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BetaSignup from '../components/BetaSignup';
import { betaApi } from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    betaApi: {
      apply: vi.fn(),
    },
  };
});

describe('BetaSignup', () => {
  const applyMock = vi.mocked(betaApi.apply);

  beforeEach(() => {
    applyMock.mockReset();
  });

  it('submits beta applications through the API', async () => {
    applyMock.mockResolvedValue({ message: 'ok' });
    render(<BetaSignup />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Doe');
    await user.type(screen.getByPlaceholderText('Acme Inc'), 'Acme Inc');
    await user.type(screen.getByPlaceholderText('john@acme.com'), 'jane@acme.com');
    await user.type(
      screen.getByPlaceholderText('Tell us about the banking rails you\'re looking to build...'),
      'Issuance and treasury.'
    );

    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(applyMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@acme.com',
      company: 'Acme Inc',
      useCase: 'Issuance and treasury.',
    });
    expect(await screen.findByText('Application Encrypted & Sent')).toBeInTheDocument();
  });

  it('shows an error when the submission fails', async () => {
    applyMock.mockRejectedValue(new Error('Service unavailable'));
    render(<BetaSignup />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Doe');
    await user.type(screen.getByPlaceholderText('Acme Inc'), 'Acme Inc');
    await user.type(screen.getByPlaceholderText('john@acme.com'), 'jane@acme.com');
    await user.type(
      screen.getByPlaceholderText('Tell us about the banking rails you\'re looking to build...'),
      'Issuance and treasury.'
    );

    await user.click(screen.getByRole('button', { name: 'Submit Application' }));

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
  });

  it('disables the submit button while sending', async () => {
    let resolvePromise: (value: { message: string }) => void;
    const pendingPromise = new Promise<{ message: string }>((resolve) => {
      resolvePromise = resolve;
    });
    applyMock.mockReturnValue(pendingPromise);

    render(<BetaSignup />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Doe');
    await user.type(screen.getByPlaceholderText('Acme Inc'), 'Acme Inc');
    await user.type(screen.getByPlaceholderText('john@acme.com'), 'jane@acme.com');
    await user.type(
      screen.getByPlaceholderText("Tell us about the banking rails you're looking to build..."),
      'Issuance and treasury.'
    );

    const submitButton = screen.getByRole('button', { name: 'Submit Application' });
    await user.click(submitButton);

    expect(screen.getByText('Submitting Application...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolvePromise!({ message: 'ok' });
    expect(await screen.findByText('Application Encrypted & Sent')).toBeInTheDocument();
  });
});
