import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracka endast i production
  enabled: process.env.NODE_ENV === "production",

  // Adjust sample rate för production
  tracesSampleRate: 1.0, // 100% av transactions (sänk till 0.1 om mycket trafik)

  // Session Replay (se vad användaren gjorde före error)
  replaysSessionSampleRate: 0.1, // 10% av sessions
  replaysOnErrorSampleRate: 1.0, // 100% när error inträffar

  // Ignorera vissa errors (common false positives)
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Network errors (användaren tappade anslutning)
    "Network request failed",
    "Failed to fetch",
    // ResizeObserver (vanligt false positive)
    "ResizeObserver loop limit exceeded",
  ],

  // Lägg till användarkontext
  beforeSend(event, hint) {
    // Filtrera bort känslig data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    
    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
});