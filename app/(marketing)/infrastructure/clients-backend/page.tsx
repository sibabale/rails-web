import type { Metadata } from 'next';
import ClientsBackendPage from '@/components/pages/marketing/infrastructure/ClientsBackendPage';

export const metadata: Metadata = {
  title: 'Backend SDKs | Rails Infra',
  description:
    'Integrate Rails from your backend with official TypeScript, Go, Kotlin, Java, and .NET SDKs.',
  alternates: {
    canonical: '/infrastructure/clients-backend',
  },
};

export default function ClientsBackendRoute() {
  return <ClientsBackendPage />;
}
