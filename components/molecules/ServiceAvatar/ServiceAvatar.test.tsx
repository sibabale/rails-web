import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServiceAvatar from './ServiceAvatar';

describe('ServiceAvatar', () => {
  it('renders both the primary and accent icon names', () => {
    render(
      <ServiceAvatar
        primaryIcon="cloud"
        accentIcon="bolt"
        accentClassName="bg-zinc-100"
      />
    );
    expect(screen.getByText('cloud')).toBeInTheDocument();
    expect(screen.getByText('bolt')).toBeInTheDocument();
  });
});
