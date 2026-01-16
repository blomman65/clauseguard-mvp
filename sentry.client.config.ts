import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Production mode - no debug logging
  debug: false,

  // Aktivera endast om DSN finns
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Sample rates
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // KRITISKT: Ingen PII
  sendDefaultPii: false,

  // Filtrera känslig data
  beforeSend(event, hint) {
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",

  // Ignorera common false positives
  ignoreErrors: [
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    "Network request failed",
    "Failed to fetch",
    "ResizeObserver loop limit exceeded",
    "cookieConsentChanged",
  ],
});