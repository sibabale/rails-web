const seoConfig = {
  siteName: 'Rails',
  defaultTitle: 'Rails',
  titleTemplate: '%s | Rails',
  defaultDescription:
    'Banking infrastructure for developers with programmable accounts, payments, and a modern ledger.',
  siteUrl: 'https://rails.example.com',
  canonicalPath: '/',
  ogImagePath: '/og-image.svg',
  twitterCard: 'summary_large_image',
  publicRoutes: ['/'],
  disallowRoutes: [
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/admin',
    '/api',
    '/internal'
  ]
};

export default seoConfig;
