import type { Metadata } from 'next';
import InfrastructureDatabasePage from '@/components/marketing/pages/infrastructure/InfrastructureDatabasePage';

export const metadata: Metadata = {
  title: 'PostgreSQL & data | Rails Infra',
  description:
    'Bring your own PostgreSQL provider. SQL migrations for Neon, Supabase, or self-hosted databases.',
  alternates: {
    canonical: '/infrastructure/database',
  },
};

export default function InfrastructureDatabaseRoute() {
  return <InfrastructureDatabasePage />;
}
