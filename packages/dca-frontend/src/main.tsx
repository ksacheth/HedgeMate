import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import Dashboard from './pages/dashboard.jsx';
import { initZendesk } from '@/lib/zendesk';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { env } from '@/config/env';
import { Web3Provider } from '@/components/web3-provider';
import { JwtProvider } from '@lit-protocol/vincent-app-sdk/react';
import { Rules } from './pages/rules';

// Initialize Zendesk support widget
initZendesk();

const { VITE_BACKEND_URL, VITE_IS_DEVELOPMENT, VITE_SENTRY_DSN, VITE_SENTRY_FILTER, VITE_APP_ID } =
  env;

if (VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: VITE_SENTRY_DSN,
    enabled: !VITE_IS_DEVELOPMENT,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    tracePropagationTargets: [VITE_BACKEND_URL],
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.thirdPartyErrorFilterIntegration({
        behaviour: 'drop-error-if-contains-third-party-frames',
        filterKeys: [VITE_SENTRY_FILTER],
      }),
    ],
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JwtProvider appId={VITE_APP_ID}>
      <Web3Provider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />} path="/" />
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Rules />} path="/rules" />
          </Routes>
        </BrowserRouter>
      </Web3Provider>
    </JwtProvider>
  </StrictMode>
);
