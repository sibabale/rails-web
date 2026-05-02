import type { Metadata } from 'next';
import UseCasesPage from '@/components/marketing/pages/UseCasesPage';

export const metadata: Metadata = {
  title: 'Use Cases | Rails Infra',
  description:
    'See how banks and fintechs use Rails infrastructure to ship faster and reduce maintenance cost.',
  alternates: {
    canonical: '/use-cases',
  },
  openGraph: {
    title: 'Use Cases | Rails Infra',
    description:
      'See how banks and fintechs use Rails infrastructure to ship faster and reduce maintenance cost.',
    url: '/use-cases',
    siteName: 'Rails Infra',
    type: 'website',
  },
};

export default function UseCasesRoute() {
  return <UseCasesPage />;
}
