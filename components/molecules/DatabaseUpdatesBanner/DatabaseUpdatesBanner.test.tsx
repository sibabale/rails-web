import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DatabaseUpdatesBanner from './DatabaseUpdatesBanner';

describe('DatabaseUpdatesBanner', () => {
  it('does not render when there are no updates', () => {
    const { container } = render(<DatabaseUpdatesBanner pendingMigrationCount={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders singular copy for one update', () => {
    render(<DatabaseUpdatesBanner pendingMigrationCount={1} />);
    expect(screen.getByText('Database updates available')).toBeInTheDocument();
    expect(screen.getByText('1 database update is ready to apply.')).toBeInTheDocument();
  });
});
