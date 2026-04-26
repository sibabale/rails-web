import SiteLayout from '@/components/marketing/SiteLayout';
import { MarketingCopyVariantProvider } from '@/components/marketing/MarketingCopyVariantProvider';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingCopyVariantProvider>
      <SiteLayout>{children}</SiteLayout>
    </MarketingCopyVariantProvider>
  );
}
