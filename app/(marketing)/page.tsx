import type { Metadata } from 'next';
import MarketingHome from '@/components/marketing/pages/MarketingHome';

export const metadata: Metadata = {
  title: 'Rails | Open-source banking rails for modern finance',
  description:
    'Build accounts, wallets, ledgers, and money movement systems faster—with hardened infrastructure and bank-grade integrity.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rails | Open-source banking rails for modern finance',
    description:
      'Build accounts, wallets, ledgers, and money movement systems faster—with hardened infrastructure and bank-grade integrity.',
    url: '/',
    siteName: 'Rails',
    type: 'website',
  },
};

export default function HomePage() {
  return <MarketingHome />;
}
