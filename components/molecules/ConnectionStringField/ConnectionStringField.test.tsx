import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectionStringField from './ConnectionStringField';

describe('ConnectionStringField', () => {
  const baseProps = {
    name: 'connection_string',
    placeholder: 'postgres://…',
    ariaLabel: 'connection string',
  };

  const installMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  };

  it('renders the input with the provided value and aria label', () => {
    installMatchMedia(false);
    render(
      <ConnectionStringField
        {...baseProps}
        value="postgres://user:pass@host/db"
        onChange={() => undefined}
        onCopy={() => undefined}
      />
    );
    const input = screen.getByLabelText('connection string') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('postgres://user:pass@host/db');
  });

  it('invokes onCopy with the current value when the copy button is clicked', async () => {
    installMatchMedia(false);
    const onCopy = vi.fn();
    const user = userEvent.setup();
    render(
      <ConnectionStringField
        {...baseProps}
        value="abc"
        onChange={() => undefined}
        onCopy={onCopy}
      />
    );
    await user.click(screen.getByRole('button', { name: /Copy connection string/i }));
    expect(onCopy).toHaveBeenCalledWith('abc');
  });

  it('toggles connection string visibility from password to text', async () => {
    installMatchMedia(false);
    const user = userEvent.setup();
    render(
      <ConnectionStringField
        {...baseProps}
        value="postgres://user:pass@host/db"
        onChange={() => undefined}
        onCopy={() => undefined}
      />
    );

    const input = screen.getByLabelText('connection string') as HTMLInputElement;
    expect(input.type).toBe('password');

    await user.click(screen.getByRole('button', { name: /Show connection string/i }));
    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: /Hide connection string/i })).toBeInTheDocument();
  });

  it('shows spinner then check then resets to copy icon after a successful copy', async () => {
    installMatchMedia(false);
    vi.useFakeTimers();
    let resolveCopy: (() => void) | null = null;
    const onCopy = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCopy = resolve;
        })
    );

    render(
      <ConnectionStringField
        {...baseProps}
        value="postgres://value"
        onChange={() => undefined}
        onCopy={onCopy}
      />
    );

    const button = screen.getByRole('button', { name: /Copy connection string/i });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: /Copying connection string/i })).toBeDisabled();
    const copyButtonDuringLoading = screen.getByRole('button', { name: /Copying connection string/i });
    const spinnerIcon = copyButtonDuringLoading.querySelector('.material-symbols-sharp');
    expect(spinnerIcon).toHaveTextContent('progress_activity');
    expect(spinnerIcon).toHaveClass('animate-spin');

    resolveCopy?.();
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: /Copied connection string/i })).toBeInTheDocument();
    const copiedButton = screen.getByRole('button', { name: /Copied connection string/i });
    const checkIcon = copiedButton.querySelector('.material-symbols-sharp');
    expect(checkIcon).toHaveTextContent('check');
    expect(checkIcon).not.toHaveClass('animate-spin');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(screen.getByRole('button', { name: /Copy connection string/i })).toBeInTheDocument();
    const resetCopyButton = screen.getByRole('button', { name: /Copy connection string/i });
    const copyIcon = resetCopyButton.querySelector('.material-symbols-sharp');
    expect(copyIcon).toHaveTextContent('content_copy');

    vi.useRealTimers();
  });

  it('keeps spinner static for reduced-motion users', async () => {
    installMatchMedia(true);
    const onCopy = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 50);
        })
    );
    render(
      <ConnectionStringField
        {...baseProps}
        value="postgres://value"
        onChange={() => undefined}
        onCopy={onCopy}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Copy connection string/i }));
    const copyButtonDuringLoading = screen.getByRole('button', { name: /Copying connection string/i });
    const spinnerIcon = copyButtonDuringLoading.querySelector('.material-symbols-sharp');
    expect(spinnerIcon).toHaveTextContent('progress_activity');
    expect(spinnerIcon).not.toHaveClass('animate-spin');
  });

  it('returns to copy icon if copy action fails', async () => {
    installMatchMedia(false);
    const onCopy = vi.fn(async () => {
      throw new Error('copy failed');
    });

    render(
      <ConnectionStringField
        {...baseProps}
        value="postgres://value"
        onChange={() => undefined}
        onCopy={onCopy}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Copy connection string/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy connection string/i })).toBeInTheDocument();
    });
    const copyButton = screen.getByRole('button', { name: /Copy connection string/i });
    expect(copyButton.querySelector('.material-symbols-sharp')).toHaveTextContent('content_copy');
  });

  it('disables copy when input value is empty', () => {
    installMatchMedia(false);
    render(
      <ConnectionStringField
        {...baseProps}
        value=""
        onChange={() => undefined}
        onCopy={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: /Copy connection string/i })).toBeDisabled();
  });
});
