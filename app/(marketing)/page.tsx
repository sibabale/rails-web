import type { Metadata } from 'next';
import MarketingHome from '@/components/marketing/pages/MarketingHome';

export const metadata: Metadata = {
  title: 'Rails | Bank—infrastructure you can run',
  description:
    'Start with a working setup for your bank, with a clear history when someone asks what happened. Open source, self-hostable.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rails | Bank—infrastructure you can run',
    description:
      'Start with a working setup for your bank, with a clear history when someone asks what happened. Open source, self-hostable.',
    url: '/',
    siteName: 'Rails',
    type: 'website',
  },
};

export default function HomePage() {
  return <MarketingHome />;
}
