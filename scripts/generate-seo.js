import fs from 'node:fs';
import path from 'node:path';
import seoConfig from '../seo.config.js';

const mode = process.env.MODE || process.env.NODE_ENV || 'development';
const isProd = mode === 'production';
const allowIndexing = isProd && process.env.VITE_ALLOW_INDEXING === 'true';

const normalizeUrl = (url) => url.replace(/\/$/, '');
const siteUrl = normalizeUrl(process.env.VITE_SITE_URL || seoConfig.siteUrl);
const publicRoutes = seoConfig.publicRoutes || ['/'];
const disallowRoutes = seoConfig.disallowRoutes || [];

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });

const robotsLines = [
  'User-agent: *',
  ...(allowIndexing
    ? disallowRoutes.map((route) => `Disallow: ${route}`)
    : ['Disallow: /'])
];

if (allowIndexing) {
  robotsLines.push('Allow: /');
  robotsLines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
}

const robotsTxt = `${robotsLines.join('\n')}\n`;

const lastmod = new Date().toISOString();
const urlEntries = publicRoutes
  .map((route) => {
    const loc = `${siteUrl}${route === '/' ? '' : route}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  })
  .join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
