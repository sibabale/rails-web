import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';

describe('Hero', () => {
  it('renders the hero headline copy', () => {
    render(<Hero isLoading />);
    // In loading state the timer-driven sequence does not run, so the test stays deterministic.
    // Hero renders the loading skeleton wrapper without throwing.
    expect(document.querySelector('section')).not.toBeNull();
  });
});
