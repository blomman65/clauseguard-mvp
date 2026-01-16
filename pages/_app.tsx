import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics, isAnalyticsReady } from '../lib/analytics';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Init analytics when cookie consent is given
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initIfConsented = () => {
      const consent = localStorage.getItem('cookie-consent');
      
      if (consent === 'accepted' && !isAnalyticsReady()) {
        console.log('🍪 Cookie consent accepted - initializing analytics');
        initAnalytics();
      } else if (consent === 'declined') {
        console.log('🍪 Cookie consent declined - analytics disabled');
      }
    };

    // Check on mount
    initIfConsented();

    // Listen for consent changes
    const handleConsentChange = () => {
      initIfConsented();
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (isAnalyticsReady()) {
        analytics.pageView(url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}