import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { initAnalytics, analytics } from '../lib/analytics';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [analyticsReady, setAnalyticsReady] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // ⚠️ KRITISK FIX: Initialize analytics based on consent
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndInitAnalytics = () => {
      const consent = localStorage.getItem('cookie-consent');
      
      console.log('🍪 Current consent status:', consent);
      
      if (consent === 'accepted' && !analyticsReady) {
        console.log('✅ Cookie consent accepted - initializing analytics');
        initAnalytics();
        setAnalyticsReady(true);
        
        // ⚠️ FIX: Vänta lite extra så PostHog hinner initieras
        setTimeout(() => {
          analytics.pageView(router.pathname);
        }, 300);
      } else if (consent === 'declined') {
        console.log('❌ Cookie consent declined - analytics disabled');
        setAnalyticsReady(false);
      } else {
        console.log('⏳ No consent decision yet');
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

  // ⚠️ KRITISK FIX: Track route changes (only if analytics is active)
  useEffect(() => {
    if (!analyticsReady) {
      console.log('⏭️ Skipping route tracking - analytics not ready');
      return;
    }

    const handleRouteChange = (url: string) => {
      console.log('🔄 Route changed:', url);
      // ⚠️ FIX: Liten delay för att säkerställa analytics är redo
      setTimeout(() => {
        analytics.pageView(url);
      }, 100);
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