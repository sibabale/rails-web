import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonBlock from './SkeletonBlock';

describe('SkeletonBlock', () => {
  it('renders without crashing and exposes a stable test id', () => {
    render(<SkeletonBlock />);
    expect(screen.getByTestId('skeleton-block')).toBeInTheDocument();
  });

  it('exposes a status role and label when ariaLabel is provided', () => {
    render(<SkeletonBlock ariaLabel="Loading…" />);
    expect(screen.getByRole('status', { name: 'Loading…' })).toBeInTheDocument();
  });
});
