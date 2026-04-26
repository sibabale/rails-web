import type { Metadata } from 'next';
import InfrastructurePage from '@/components/marketing/pages/InfrastructurePage';

export const metadata: Metadata = {
  title: 'Infrastructure | Rails',
  description:
    'Rails infrastructure overview: SDKs, API layer, ledger, and PostgreSQL—built for reliable money movement.',
  alternates: {
    canonical: '/infrastructure',
  },
  openGraph: {
    title: 'Infrastructure | Rails',
    description:
      'Rails infrastructure overview: SDKs, API layer, ledger, and PostgreSQL—built for reliable money movement.',
    url: '/infrastructure',
    siteName: 'Rails',
    type: 'website',
  },
};

export default function InfrastructureRoute() {
  return <InfrastructurePage />;
}
