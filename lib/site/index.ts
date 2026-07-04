/** Public site origin for canonical URLs, Open Graph, sitemap, and robots. Override with NEXT_PUBLIC_SITE_URL in each environment. */
export const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.startsWith('http')) return envUrl.replace(/\/$/, '');
  return 'https://www.railsinfra.com';
};
