import type { Metadata } from 'next';
import InfrastructurePage from '@/components/pages/marketing/InfrastructurePage';

export const metadata: Metadata = {
  title: 'Infrastructure | Rails Infra',
  description:
    'Rails infrastructure overview: SDKs, API layer, ledger, and PostgreSQL—built for reliable money movement.',
  alternates: {
    canonical: '/infrastructure',
  },
  openGraph: {
    title: 'Infrastructure | Rails Infra',
    description:
      'Rails infrastructure overview: SDKs, API layer, ledger, and PostgreSQL—built for reliable money movement.',
    url: '/infrastructure',
    siteName: 'Rails Infra',
    type: 'website',
  },
};

export default function InfrastructureRoute() {
  return <InfrastructurePage />;
}
