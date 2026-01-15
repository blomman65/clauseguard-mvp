import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics } from '../lib/analytics';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [analyticsReady, setAnalyticsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lyssna på cookie consent events
    const handleConsentChange = () => {
      const consent = localStorage.getItem('cookie-consent');
      
      if (consent === 'accepted' && !analyticsReady) {
        console.log('✅ Cookie consent accepted - initializing analytics');
        initAnalytics();
        setAnalyticsReady(true);
        
        // Tracka initial pageview
        analytics.pageView(router.pathname);
      }
    };

    // Kolla om consent redan finns
    handleConsentChange();

    // Lyssna på custom event från CookieBanner
    window.addEventListener('cookieConsentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, [router.pathname, analyticsReady]);

  // Tracka route changes (endast om analytics är aktivt)
  useEffect(() => {
    if (!analyticsReady) return;

    const handleRouteChange = (url: string) => {
      analytics.pageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, analyticsReady]);

  return <Component {...pageProps} />;
}