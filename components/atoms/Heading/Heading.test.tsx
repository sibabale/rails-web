import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders the requested level by default (h2)', () => {
    render(<Heading>Hello</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Hello' })).toBeInTheDocument();
  });

  it('renders a level 1 heading when requested', () => {
    render(<Heading level={1}>Top</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Top' })).toBeInTheDocument();
  });

  it('honours a data-testid', () => {
    render(<Heading data-testid="page-title">Title</Heading>);
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
  });
});
