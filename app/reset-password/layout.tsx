import type { Metadata } from 'next';
import { MarketingAuthShell } from '@/components/templates/MarketingAuthShell/MarketingAuthShell';

export const metadata: Metadata = {
  title: 'Reset Password | Rails Infra',
  description: 'Set a new password for your Rails account.',
  alternates: {
    canonical: '/reset-password',
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <MarketingAuthShell>{children}</MarketingAuthShell>;
}
