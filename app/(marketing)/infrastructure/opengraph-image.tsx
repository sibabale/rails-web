import { OG_IMAGE_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Infrastructure | Rails Infra';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Infrastructure',
    title: 'Ledger, APIs, and SDKs',
    description: 'SDKs, an API layer, ledger, and PostgreSQL — built for reliable money movement.',
  });
}
