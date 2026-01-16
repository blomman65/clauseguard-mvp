import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Endast i production
  enabled: process.env.NODE_ENV === "production",

  // Sample rate
  tracesSampleRate: 1.0,

  // Ignorera vissa errors
  ignoreErrors: [
    // Rate limit errors (förväntade)
    "Too many requests",
    // OpenAI timeout (förväntade ibland)
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
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
});