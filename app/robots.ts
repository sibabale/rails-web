import type { MetadataRoute } from 'next';
import { getSiteUrl } from '../lib/site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProd = process.env.NODE_ENV === 'production';

  return {
    rules: isProd
      ? [
          {
            userAgent: '*',
            allow: '/',
          },
        ]
      : [
          {
            userAgent: '*',
            disallow: '/',
          },
        ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
