import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Features from './Features';

describe('Features', () => {
  it('renders the core infrastructure section header', () => {
    render(<Features />);
    expect(screen.getByText('Core Infrastructure')).toBeInTheDocument();
  });
});
