import { OG_IMAGE_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Use Cases | Rails Infra';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Use cases',
    title: 'Built for banks & fintechs',
    description: 'See how teams use Rails infrastructure to ship faster and reduce maintenance cost.',
  });
}
