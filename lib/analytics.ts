import posthog from 'posthog-js';

let isInitialized = false;

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';

  if (!posthogKey) {
    console.error('❌ PostHog key missing');
    return;
  }

  console.log('🚀 Initializing PostHog...');

  try {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (posthogInstance) => {
        isInitialized = true;
        console.log('✅ PostHog initialized successfully');
        
        // OPT IN direkt efter init - detta är nyckeln!
        posthogInstance.opt_in_capturing();
        console.log('✅ PostHog capturing enabled');
      },
      capture_pageview: true, // ÄNDRAT: Låt PostHog hantera pageviews automatiskt
      capture_pageleave: true,
      autocapture: false,
      persistence: 'localStorage',
      session_recording: {
        recordCrossOriginIframes: false,
      },
      // TA BORT opt_out_capturing_by_default helt!
    });
    
    console.log('📊 PostHog configuration complete');
  } catch (error) {
    console.error('❌ PostHog init failed:', error);
    isInitialized = false;
  }
};

const ensureInitialized = () => {
  if (typeof window === 'undefined') return false;
  if (!isInitialized) {
    console.warn('⚠️ PostHog not initialized yet');
    return false;
  }
  return true;
};

export const analytics = {
  pageView: (pageName: string) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 PageView:', pageName);
      posthog.capture('$pageview', { page: pageName });
    } catch (error) {
      console.error('❌ PostHog pageView error:', error);
    }
  },

  conversionFunnelStep: (step: string) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Funnel step:', step);
      posthog.capture('conversion_funnel_step', {
        step,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  sampleClicked: () => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Sample clicked');
      posthog.capture('sample_clicked', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  sampleAnalyzed: (riskLevel: string) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Sample analyzed:', riskLevel);
      posthog.capture('sample_analyzed', {
        risk_level: riskLevel,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  checkoutStarted: () => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Checkout started');
      posthog.capture('checkout_started', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  paymentCompleted: () => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Payment completed');
      posthog.capture('payment_completed', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  analysisStarted: (isSample: boolean, contractLength: number) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Analysis started:', { isSample, contractLength });
      posthog.capture('analysis_started', {
        is_sample: isSample,
        contract_length: contractLength,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  analysisCompleted: (isSample: boolean, riskLevel: string, timeMs: number) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Analysis completed:', { isSample, riskLevel, timeMs });
      posthog.capture('analysis_completed', {
        is_sample: isSample,
        risk_level: riskLevel,
        analysis_time_ms: timeMs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  analysisFailed: (error: string, isSample: boolean) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 Analysis failed:', { error, isSample });
      posthog.capture('analysis_failed', {
        error,
        is_sample: isSample,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  pdfDownloaded: (riskLevel: string) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 PDF downloaded:', riskLevel);
      posthog.capture('pdf_downloaded', {
        risk_level: riskLevel,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },

  identifyUser: (userId: string, properties?: Record<string, any>) => {
    if (!ensureInitialized()) return;
    try {
      console.log('📊 User identified:', userId);
      posthog.identify(userId, properties);
    } catch (error) {
      console.error('❌ PostHog error:', error);
    }
  },
};

export const isAnalyticsReady = () => isInitialized;
export { posthog };