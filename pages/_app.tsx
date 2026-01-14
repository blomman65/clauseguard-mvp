import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics } from '../lib/analytics';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initiera PostHog
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
  }, [router]);

  return <Component {...pageProps} />;
}