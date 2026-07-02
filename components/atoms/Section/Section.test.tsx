import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('renders its children inside a section element', () => {
    render(<Section>body</Section>);
    expect(screen.getByText('body').tagName.toLowerCase()).toBe('section');
  });
});
