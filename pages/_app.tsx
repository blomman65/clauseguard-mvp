import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics } from '../lib/analytics';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Check cookie consent before initializing PostHog
    const consent = localStorage.getItem('cookie-consent');
    
    if (consent === 'accepted') {
      // Initiera PostHog endast om användaren accepterat
      initAnalytics();
      
      // Tracka initial pageview
      analytics.pageView(router.pathname);
      
      // Tracka route changes
      const handleRouteChange = (url: string) => {
        analytics.pageView(url);
      };
      
      router.events.on('routeChangeComplete', handleRouteChange);
      
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    } else if (consent === null) {
      // Ingen consent ännu - initiera PostHog men opt-out tills användaren väljer
      initAnalytics();
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.opt_out_capturing();
      }
    }
  }, [router]);

  return (
    <>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}