import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SecondaryButton from './SecondaryButton';

describe('SecondaryButton', () => {
  it('renders its children inside a button', () => {
    render(<SecondaryButton>Click</SecondaryButton>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('marks the button as busy and disabled when loading', () => {
    render(<SecondaryButton loading>Click</SecondaryButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
