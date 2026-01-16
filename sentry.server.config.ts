import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Production mode - no debug logging
  debug: false,

  // Aktivera endast om DSN finns
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Sample rate
  tracesSampleRate: 1.0,

  // Ignorera vissa errors
  ignoreErrors: [
    "Too many requests",
    "timeout",
  ],

  // Filtrera känslig data
  beforeSend(event, hint) {
    // Ta bort contract text från error logs (privacy!)
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.contractText) {
        data.contractText = "[REDACTED]";
      }
    }
    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",
});