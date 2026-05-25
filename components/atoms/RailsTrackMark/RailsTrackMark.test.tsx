import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RailsTrackMark } from './RailsTrackMark';

describe('RailsTrackMark', () => {
  it('renders the mark with a stable testid', () => {
    render(<RailsTrackMark />);
    expect(screen.getByTestId('rails-track-mark')).toBeInTheDocument();
  });
});
