import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).not.toBeNull();
  });

  it('exposes a status role and label when ariaLabel is provided', () => {
    render(<Spinner ariaLabel="Loading…" />);
    expect(screen.getByRole('status', { name: 'Loading…' })).toBeInTheDocument();
  });
});
