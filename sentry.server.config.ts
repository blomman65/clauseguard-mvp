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
    "Rate limit",
    "ECONNRESET",
    "ETIMEDOUT",
  ],

  // Filtrera känslig data
  beforeSend(event, hint) {
    // Ta bort contract text från error logs (privacy!)
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.contractText) {
        data.contractText = "[REDACTED]";
      }
      if (data.analysis) {
        data.analysis = "[REDACTED]";
      }
      // Skydda access tokens
      if (data.accessToken) {
        data.accessToken = data.accessToken.substring(0, 8) + "...[REDACTED]";
      }
    }

    // Ta bort känsliga headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-stripe-signature'];
    }

    // Ta bort känslig breadcrumb-data
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          const data = breadcrumb.data as any;
          if (data.contractText) data.contractText = "[REDACTED]";
          if (data.analysis) data.analysis = "[REDACTED]";
          if (data.accessToken) data.accessToken = "[REDACTED]";
        }
        return breadcrumb;
      });
    }

    // Filtrera URL query params
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        // Ta bort session_id och token från URL
        if (url.searchParams.has('session_id')) {
          url.searchParams.set('session_id', '[REDACTED]');
        }
        if (url.searchParams.has('token')) {
          url.searchParams.set('token', '[REDACTED]');
        }
        event.request.url = url.toString();
      } catch (e) {
        // Ignorera om URL parsing misslyckas
      }
    }

    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",
});