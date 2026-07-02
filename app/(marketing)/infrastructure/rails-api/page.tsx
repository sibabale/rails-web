import type { Metadata } from 'next';
import RailsApiPage from '@/components/pages/marketing/infrastructure/RailsApiPage';

export const metadata: Metadata = {
  title: 'Rails API | Rails Infra',
  description:
    'Microservices architecture for accounts, users, ledger, and safe money movement at scale.',
  alternates: {
    canonical: '/infrastructure/rails-api',
  },
};

export default function RailsApiRoute() {
  return <RailsApiPage />;
}
