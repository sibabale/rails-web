import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Banner from './Banner';

describe('Banner', () => {
  it('renders its children', () => {
    render(<Banner>hello</Banner>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders the title and exposes the requested role', () => {
    render(
      <Banner role="alert" title="Heads up">
        Body
      </Banner>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('exposes the testId on the root element', () => {
    render(<Banner testId="banner-root">hi</Banner>);
    expect(screen.getByTestId('banner-root')).toBeInTheDocument();
  });
});
