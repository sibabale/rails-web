import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchitectureDiagram from './ArchitectureDiagram';

describe('ArchitectureDiagram', () => {
  it('renders the SDK section label when activeSection includes clients', () => {
    render(<ArchitectureDiagram activeSection="all" />);
    expect(screen.getByText('SDK')).toBeInTheDocument();
  });
});
