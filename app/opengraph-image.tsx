import { OG_IMAGE_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Rails Infra — Open source banking infrastructure';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Open source banking',
    title: 'Ledger infrastructure for banks & fintechs',
    description:
      'A working setup for your bank, with a clear history when someone asks what happened. Open source, self-hostable.',
  });
}
