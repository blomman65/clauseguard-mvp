import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics } from '../lib/analytics';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [analyticsReady, setAnalyticsReady] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Initialize analytics based on consent
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndInitAnalytics = () => {
      const consent = localStorage.getItem('cookie-consent');
      
      console.log('🍪 Current consent status:', consent);
      
      if (consent === 'accepted' && !analyticsReady) {
        console.log('✅ Cookie consent accepted - initializing analytics');
        initAnalytics();
        setAnalyticsReady(true);
        
        // Track initial pageview
        setTimeout(() => {
          analytics.pageView(router.pathname);
        }, 100);
      } else if (consent === 'declined') {
        console.log('❌ Cookie consent declined - analytics disabled');
        setAnalyticsReady(false);
      }
      
      setConsentChecked(true);
    };

    // Check immediately on mount
    checkAndInitAnalytics();

    // Listen for consent changes from CookieBanner
    const handleConsentChange = () => {
      console.log('🍪 Consent changed - rechecking...');
      checkAndInitAnalytics();
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, [router.pathname, analyticsReady]);

  // Track route changes (only if analytics is active)
  useEffect(() => {
    if (!analyticsReady) return;

    const handleRouteChange = (url: string) => {
      console.log('🔄 Route changed:', url);
      analytics.pageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, analyticsReady]);

  return (
    <>
      <Component {...pageProps} />
      {consentChecked && <CookieBanner />}
    </>
  );
}