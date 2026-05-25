import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders its children', () => {
    render(<Container>inside</Container>);
    expect(screen.getByText('inside')).toBeInTheDocument();
  });
});
