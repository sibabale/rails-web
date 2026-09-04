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

/**
 * The site's actual logo mark (public/logo.svg): a rounded square with two
 * full-height verticals and four evenly spaced horizontal rules between
 * them — redrawn with plain divs since satori can't render arbitrary SVGs.
 */
function LogoMark({ size = 40 }: { size?: number }) {
  const s = size / 24;
  const lineThickness = Math.max(1, s);
  const barLeftX = 6.24463 * s;
  const barRightX = 18.229 * s;
  const barTopY = 4 * s;
  const barHeight = 16 * s;
  const ruleLeftX = 6.4157 * s;
  const ruleWidth = (18.229 - 6.4157) * s;
  const ruleYs = [5.56665, 9.83325, 14.1001, 18.3667].map((y) => y * s);

  return (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        borderRadius: 2 * s,
        background: '#000000',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', left: barLeftX, top: barTopY, width: lineThickness, height: barHeight, background: '#fff' }} />
      <div style={{ position: 'absolute', left: barRightX, top: barTopY, width: lineThickness, height: barHeight, background: '#fff' }} />
      {ruleYs.map((y) => (
        <div
          key={y}
          style={{ position: 'absolute', left: ruleLeftX, top: y, width: ruleWidth, height: lineThickness, background: '#fff' }}
        />
      ))}
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
export async function renderOgImage({ eyebrow, title }: OgImageContent) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          fontFamily: 'Space Grotesk',
          padding: '64px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Logo mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <LogoMark size={48} />
          <span
            style={{
              fontFamily: 'Noto Sans Mono',
              fontSize: 24,
              letterSpacing: '0.08em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            Rails Infra
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            maxWidth: 920,
            marginBottom: 28,
          }}
        >
          {title}
        </div>

        {/* Eyebrow tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'Noto Sans Mono',
            fontSize: 20,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#71717a',
          }}
        >
          <span style={{ display: 'flex', width: 8, height: 8, borderRadius: 999, background: '#059669' }} />
          {eyebrow}
        </div>

        {/* Footer: site url */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 40,
            fontFamily: 'Noto Sans Mono',
            fontSize: 16,
            letterSpacing: '0.05em',
            color: '#3f3f46',
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
