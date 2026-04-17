'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { getPostHogKey, getPostHogOptions, isAnalyticsEnabled } from '../lib/analytics';
import { persistor, store } from '../state/store';

type ProvidersProps = {
  children: React.ReactNode;
};

function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = (savedTheme || 'dark') === 'dark';
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  return null;
}

export default function Providers({ children }: ProvidersProps) {
  const posthogKey = getPostHogKey();
  const shouldEnablePostHog = Boolean(posthogKey) && isAnalyticsEnabled();

  useEffect(() => {
    if (!shouldEnablePostHog || !posthogKey) return;
    posthog.init(posthogKey, getPostHogOptions());
  }, [posthogKey, shouldEnablePostHog]);

  const app = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeInitializer />
        {children}
      </PersistGate>
    </Provider>
  );

  if (!shouldEnablePostHog) return app;

  return <PostHogProvider client={posthog}>{app}</PostHogProvider>;
}
