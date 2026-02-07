import './main.css';
import './theme.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import App from './App';
import { persistor, store } from './state/store';
import { getPostHogOptions, getPostHogKey, isAnalyticsEnabled } from './lib/analytics';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const posthogKey = getPostHogKey();
const shouldEnablePostHog = Boolean(posthogKey) && isAnalyticsEnabled();

// Initialize PostHog before render so capture() is safe from first frame (docs: init before capture)
if (shouldEnablePostHog && posthogKey) {
  posthog.init(posthogKey, getPostHogOptions());
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {shouldEnablePostHog ? (
      <PostHogProvider client={posthog}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </PostHogProvider>
    ) : (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    )}
  </React.StrictMode>
);
