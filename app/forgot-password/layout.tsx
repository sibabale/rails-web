import type { Metadata } from 'next';
import { MarketingAuthShell } from '@/components/templates/MarketingAuthShell/MarketingAuthShell';

export const metadata: Metadata = {
  title: 'Forgot Password | Rails Infra',
  description: 'Request a secure password reset link for your Rails account.',
  alternates: {
    canonical: '/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <MarketingAuthShell>{children}</MarketingAuthShell>;
}
