import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectionStringField from './ConnectionStringField';

describe('ConnectionStringField', () => {
  const baseProps = {
    name: 'connection_string',
    placeholder: 'postgres://…',
    ariaLabel: 'connection string',
  };

  it('renders the input with the provided value and aria label', () => {
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
});
