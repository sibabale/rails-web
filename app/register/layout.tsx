import type { Metadata } from 'next';
import { MarketingAuthShell } from '@/components/marketing/MarketingAuthShell';

export const metadata: Metadata = {
  title: 'Register | Rails Infra',
  description: 'Create your institutional Rails account and access financial infrastructure tools.',
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <MarketingAuthShell>{children}</MarketingAuthShell>;
}
