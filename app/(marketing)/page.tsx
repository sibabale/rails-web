import type { Metadata } from 'next';
import MarketingHome from '@/components/marketing/pages/MarketingHome';

export const metadata: Metadata = {
  title: 'spin up a banking core in seconds | Rails Infra',
  description:
    'Start with a working setup for your bank, with a clear history when someone asks what happened. Open source, self-hostable.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'spin up a banking core in seconds | Rails Infra',
    description:
      'Start with a working setup for your bank, with a clear history when someone asks what happened. Open source, self-hostable.',
    url: '/',
    siteName: 'Rails Infra',
    type: 'website',
  },
};

export default function HomePage() {
  return <MarketingHome />;
}
