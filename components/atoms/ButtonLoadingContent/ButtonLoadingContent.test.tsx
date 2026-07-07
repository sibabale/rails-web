import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ButtonLoadingContent from './ButtonLoadingContent';

describe('ButtonLoadingContent', () => {
  it('renders children when not loading', () => {
    render(
      <ButtonLoadingContent loading={false}>
        <span>Save</span>
      </ButtonLoadingContent>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders loadingText alongside spinner when loading with loadingText', () => {
    render(
      <ButtonLoadingContent loading loadingText="Saving...">
        <span>Save</span>
      </ButtonLoadingContent>
    );
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('keeps invisible children for sizing when loading without loadingText', () => {
    render(
      <ButtonLoadingContent loading>
        <span>Save</span>
      </ButtonLoadingContent>
    );
    const wrapper = screen.getByText('Save').parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('invisible');
  });
});
