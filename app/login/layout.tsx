import type { Metadata } from 'next';
import { MarketingAuthShell } from '@/components/marketing/MarketingAuthShell';

export const metadata: Metadata = {
  title: 'Login | Rails',
  description: 'Authenticate to your Rails infrastructure account.',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <MarketingAuthShell>{children}</MarketingAuthShell>;
}
