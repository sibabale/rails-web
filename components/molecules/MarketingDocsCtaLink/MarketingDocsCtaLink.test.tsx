import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('@/lib/env', () => ({
  getMarketingDocsCtaUrl: vi.fn(() => '/docs'),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { MarketingDocsCtaLink } from './MarketingDocsCtaLink';
import { getMarketingDocsCtaUrl } from '@/lib/env';

const mockedGetUrl = vi.mocked(getMarketingDocsCtaUrl);

describe('MarketingDocsCtaLink', () => {
  beforeEach(() => {
    cleanup();
    mockedGetUrl.mockReset();
  });

  it('renders an internal link via next/link for same-site paths', () => {
    mockedGetUrl.mockReturnValue('/docs');
    render(<MarketingDocsCtaLink>Docs</MarketingDocsCtaLink>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders an external link with new-tab attributes for absolute http URLs', () => {
    mockedGetUrl.mockReturnValue('https://docs.example.com');
    render(<MarketingDocsCtaLink>Docs</MarketingDocsCtaLink>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', 'https://docs.example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
