// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // ⚠️ KRITISK FIX: Använd environment variable istället för hårdkodad DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Endast i production
  enabled: process.env.NODE_ENV === "production",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // ⚠️ KRITISK FIX: ALDRIG skicka PII data!
  sendDefaultPii: false,

  // Filtrera bort känslig data
  beforeSend(event, hint) {
    // Ta bort cookies och headers
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    
    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",

  // Ignorera vanliga false positives
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Network errors
    "Network request failed",
    "Failed to fetch",
    // ResizeObserver (vanligt false positive)
    "ResizeObserver loop limit exceeded",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;