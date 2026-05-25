import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MaterialIcon from './MaterialIcon';

describe('MaterialIcon', () => {
  it('renders the icon name as text content', () => {
    render(<MaterialIcon name="check" />);
    expect(screen.getByText('check')).toBeInTheDocument();
  });
});
