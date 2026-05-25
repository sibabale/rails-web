'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { MarketingThemeProvider } from '@/components/marketing/ThemeProvider/ThemeProvider';
import { getPostHogKey, getPostHogOptions, isAnalyticsEnabled } from '../lib/analytics';
import { persistor, store } from '../state/store';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const posthogKey = getPostHogKey();
  const shouldEnablePostHog = Boolean(posthogKey) && isAnalyticsEnabled();

  useEffect(() => {
    if (!shouldEnablePostHog || !posthogKey) return;
    posthog.init(posthogKey, getPostHogOptions());
  }, [posthogKey, shouldEnablePostHog]);

  const app = (
    <MarketingThemeProvider defaultTheme="dark" storageKey="theme">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </MarketingThemeProvider>
  );

  if (!shouldEnablePostHog) return app;

  return <PostHogProvider client={posthog}>{app}</PostHogProvider>;
}
