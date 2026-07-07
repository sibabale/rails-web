import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OnboardingStepCard from './OnboardingStepCard';

describe('OnboardingStepCard', () => {
  const baseProps = {
    stepNumber: 2,
    title: 'Generate API Key',
    description: 'Create a secure token to authenticate application requests.',
    cta: <button type="button">Manage API Key</button>,
  };

  it('renders title and description in the locked state', () => {
    render(<OnboardingStepCard {...baseProps} state="locked" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Generate API Key' })).toBeInTheDocument();
    expect(
      screen.getByText('Create a secure token to authenticate application requests.')
    ).toBeInTheDocument();
  });

  it('renders title and description in the active state', () => {
    render(<OnboardingStepCard {...baseProps} state="active" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Generate API Key' })).toBeInTheDocument();
    expect(
      screen.getByText('Create a secure token to authenticate application requests.')
    ).toBeInTheDocument();
  });

  it('renders title and description in the complete state', () => {
    render(<OnboardingStepCard {...baseProps} state="complete" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Generate API Key' })).toBeInTheDocument();
    expect(
      screen.getByText('Create a secure token to authenticate application requests.')
    ).toBeInTheDocument();
  });

  it('shows the step number when active', () => {
    render(<OnboardingStepCard {...baseProps} state="active" stepNumber={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('check')).not.toBeInTheDocument();
  });

  it('shows the step number when locked', () => {
    render(<OnboardingStepCard {...baseProps} state="locked" stepNumber={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('check')).not.toBeInTheDocument();
  });

  it('shows a check icon (and hides the step number) when complete', () => {
    render(<OnboardingStepCard {...baseProps} state="complete" stepNumber={1} />);
    expect(screen.getByText('check')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows the "Action required" pill only in the active state', () => {
    const { rerender } = render(<OnboardingStepCard {...baseProps} state="active" />);
    expect(screen.getByText('Action required')).toBeInTheDocument();

    rerender(<OnboardingStepCard {...baseProps} state="locked" />);
    expect(screen.queryByText('Action required')).not.toBeInTheDocument();

    rerender(<OnboardingStepCard {...baseProps} state="complete" />);
    expect(screen.queryByText('Action required')).not.toBeInTheDocument();
  });

  it('forwards the cta content into the card', () => {
    render(
      <OnboardingStepCard
        {...baseProps}
        state="active"
        cta={<a href="/somewhere">Custom CTA Label</a>}
      />
    );
    const link = screen.getByRole('link', { name: 'Custom CTA Label' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/somewhere');
  });

  it('attaches data-testid when provided', () => {
    render(
      <OnboardingStepCard {...baseProps} state="active" testId="onboarding-step-card-api-key" />
    );
    expect(screen.getByTestId('onboarding-step-card-api-key')).toBeInTheDocument();
  });

  it('does not attach data-testid when omitted', () => {
    const { container } = render(<OnboardingStepCard {...baseProps} state="active" />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
