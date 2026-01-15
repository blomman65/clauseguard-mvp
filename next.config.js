/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Script-src: egna scripts + PostHog + Stripe
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' eu.posthog.com eu-assets.i.posthog.com js.stripe.com",
              // Styles
              "style-src 'self' 'unsafe-inline'",
              // Bilder
              "img-src 'self' data: https: eu.posthog.com eu-assets.i.posthog.com",
              // Fonts
              "font-src 'self' data:",
              // Connect: API-anrop, websockets - FIXAD MED eu.i.posthog.com
              "connect-src 'self' api.stripe.com eu.posthog.com eu-assets.i.posthog.com eu.i.posthog.com api.openai.com https://vercel.live",
              // Iframes (Stripe checkout)
              "frame-src js.stripe.com",
              // Övrigt säkerhet
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig