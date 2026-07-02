import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  isAuthButtonsEnabled: vi.fn(() => true),
}));

import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders the brand mark', () => {
    render(<Navbar />);
    expect(screen.getByText('Rails')).toBeInTheDocument();
  });
});
