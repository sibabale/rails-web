import SiteLayout from '@/components/marketing/SiteLayout/SiteLayout';
import { MarketingCopyVariantProvider } from '@/components/organisms/MarketingCopyVariantProvider/MarketingCopyVariantProvider';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingCopyVariantProvider>
      <SiteLayout>{children}</SiteLayout>
    </MarketingCopyVariantProvider>
  );
}
