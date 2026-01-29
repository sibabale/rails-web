import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import seoConfig from './seo.config.js';

const normalizeUrl = (url: string) => url.replace(/\/$/, '');
const resolveTitle = (pageTitle: string, template: string) => {
  if (!template || !pageTitle) return pageTitle;
  if (!template.includes('%s')) return pageTitle;
  return template.replace('%s', pageTitle);
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const siteUrl = normalizeUrl(env.VITE_SITE_URL || seoConfig.siteUrl);
    const allowIndexing = mode === 'production' && env.VITE_ALLOW_INDEXING === 'true';
    const robots = allowIndexing ? 'index, follow' : 'noindex, nofollow';
    const defaultTitle = env.VITE_SEO_TITLE || seoConfig.defaultTitle;
    const titleTemplate = env.VITE_SEO_TITLE_TEMPLATE || seoConfig.titleTemplate;
    const pageTitle = env.VITE_SEO_PAGE_TITLE || '';
    const title = pageTitle ? resolveTitle(pageTitle, titleTemplate) : defaultTitle;
    const description = env.VITE_SEO_DESCRIPTION || seoConfig.defaultDescription;
    const canonicalUrl = `${siteUrl}${seoConfig.canonicalPath || '/'}`;
    const ogImageUrl = env.VITE_SEO_OG_IMAGE || `${siteUrl}${seoConfig.ogImagePath}`;
    const twitterCard = env.VITE_SEO_TWITTER_CARD || seoConfig.twitterCard;

    const seoTokens: Record<string, string> = {
      __SEO_TITLE__: title,
      __SEO_DESCRIPTION__: description,
      __SEO_ROBOTS__: robots,
      __SEO_CANONICAL__: canonicalUrl,
      __SEO_OG_TITLE__: title,
      __SEO_OG_DESCRIPTION__: description,
      __SEO_OG_URL__: canonicalUrl,
      __SEO_OG_IMAGE__: ogImageUrl,
      __SEO_TWITTER_TITLE__: title,
      __SEO_TWITTER_DESCRIPTION__: description,
      __SEO_TWITTER_IMAGE__: ogImageUrl,
      __SEO_TWITTER_CARD__: twitterCard
    };

    return {
      server: {
        port: Number(env.VITE_PORT ?? 5173),
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'seo-html-transform',
          transformIndexHtml(html) {
            let transformed = html;
            for (const [token, value] of Object.entries(seoTokens)) {
              transformed = transformed.replaceAll(token, value);
            }
            return transformed;
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
