import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1 or fewer', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} totalCount={5} onPageChange={() => undefined} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the current page and total count', () => {
    render(
      <Pagination page={2} totalPages={5} totalCount={47} onPageChange={() => undefined} />
    );
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('47 total')).toBeInTheDocument();
  });

  it('calls onPageChange when navigating forward', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Pagination page={1} totalPages={3} totalCount={20} onPageChange={onPageChange} />
    );
    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
