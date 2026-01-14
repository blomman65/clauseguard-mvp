import { useEffect, useRef } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics } from '../lib/analytics';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const analyticsInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('cookie-consent');

    // Initiera analytics EN gång och endast med consent
    if (consent === 'accepted' && !analyticsInitialized.current) {
      initAnalytics();
      analyticsInitialized.current = true;

      // Initial pageview
      analytics.pageView(router.pathname);

      // Route changes
      const handleRouteChange = (url: string) => {
        analytics.pageView(url);
      };

      router.events.on('routeChangeComplete', handleRouteChange);

      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.pathname]); // 👈 stabil dependency

  return (
    <>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}
