import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/** Shared 1200x630 social share image sized for Open Graph / Twitter cards. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

const FONT_DIR = join(process.cwd(), 'assets', 'fonts');

let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 500 | 700; style: 'normal' }[]
> | null = null;

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(join(FONT_DIR, 'SpaceGrotesk-Bold.woff')),
      readFile(join(FONT_DIR, 'SpaceGrotesk-Medium.woff')),
      readFile(join(FONT_DIR, 'NotoSansMono-Medium.woff')),
    ]).then(([spaceGroteskBold, spaceGroteskMedium, notoSansMonoMedium]) => [
      { name: 'Space Grotesk', data: spaceGroteskBold, weight: 700 as const, style: 'normal' as const },
      { name: 'Space Grotesk', data: spaceGroteskMedium, weight: 500 as const, style: 'normal' as const },
      { name: 'Noto Sans Mono', data: notoSansMonoMedium, weight: 500 as const, style: 'normal' as const },
    ]);
  }
  return fontsPromise;
}

/** The bars mark used across the site's favicon/logo, redrawn with plain divs for satori. */
function LogoMark() {
  return (
    <div
      style={{
        display: 'flex',
        width: 40,
        height: 40,
        borderRadius: 6,
        background: '#000000',
        border: '1px solid #27272a',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', left: 10, top: 6, width: 2, height: 28, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 15, top: 9, width: 19, height: 2, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 15, top: 16, width: 19, height: 2, background: '#fff' }} />
    </div>
  );
}

export type OgImageContent = {
  eyebrow: string;
  title: string;
  description: string;
};

/**
 * Renders a branded social share image: near-black background, faint
 * structural grid, monospace eyebrow label, bold Space Grotesk headline,
 * and the Rails Infra wordmark — matching the site's marketing theme.
 */
export async function renderOgImage({ eyebrow, title, description }: OgImageContent) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#020202',
          backgroundImage:
            'linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          padding: '64px 80px',
          fontFamily: 'Space Grotesk',
        }}
      >
        {/* Header: logo mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LogoMark />
          <span
            style={{
              fontFamily: 'Noto Sans Mono',
              fontSize: 22,
              letterSpacing: '0.05em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            Rails Infra
          </span>
        </div>

        {/* Body: eyebrow, title, description */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24,
              fontFamily: 'Noto Sans Mono',
              fontSize: 20,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#a1a1aa',
            }}
          >
            <span style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, background: '#059669' }} />
            {eyebrow}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: 24,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Space Grotesk',
              fontWeight: 500,
              fontSize: 28,
              lineHeight: 1.4,
              color: '#a1a1aa',
            }}
          >
            {description}
          </div>
        </div>

        {/* Footer: site url */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Noto Sans Mono',
            fontSize: 18,
            letterSpacing: '0.05em',
            color: '#71717a',
            textTransform: 'uppercase',
          }}
        >
          railsinfra.com
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts,
    }
  );
}
