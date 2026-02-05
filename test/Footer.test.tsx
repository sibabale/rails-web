import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from '../components/Footer';

describe('Footer', () => {
  it('does not render request access or social links', () => {
    render(<Footer />);

    expect(screen.queryByText('Request Access')).not.toBeInTheDocument();
    expect(screen.queryByText('Privacy')).not.toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });
});
