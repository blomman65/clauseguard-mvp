import posthog from 'posthog-js';

// Track if PostHog has been initialized
let isInitialized = false;

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  
  // Prevent double initialization
  if (isInitialized) {
    console.log('📊 PostHog already initialized');
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';

  if (!posthogKey) {
    console.error('❌ NEXT_PUBLIC_POSTHOG_KEY is missing');
    return;
  }

  console.log('📊 Initializing PostHog...');
  console.log('📊 Key:', posthogKey.substring(0, 8) + '...');
  console.log('📊 Host:', posthogHost);

  posthog.init(posthogKey, {
    api_host: posthogHost,
    loaded: (posthogInstance) => {
      console.log('✅ PostHog loaded successfully');
      
      // Only opt out in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 Development mode - opting out of tracking');
        posthogInstance.opt_out_capturing();
      } else {
        console.log('✅ Production mode - tracking enabled');
      }
    },
    capture_pageview: false, // Vi gör detta manuellt
    capture_pageleave: true,
    autocapture: false,
    persistence: 'localStorage', // Viktigt för att behålla session
    session_recording: {
      recordCrossOriginIframes: false,
    },
  });

  isInitialized = true;
};

// Helper för att säkerställa PostHog är initierat
const ensureInitialized = () => {
  if (typeof window === 'undefined') return false;
  
  if (!isInitialized) {
    console.warn('⚠️ PostHog not initialized, event not tracked');
    return false;
  }
  
  return true;
};

// Helper functions för att tracka events
export const analytics = {
  // Page views
  pageView: (pageName: string) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Page view:', pageName);
    posthog.capture('$pageview', {
      page: pageName,
    });
  },

  // Funnel / conversion tracking
  conversionFunnelStep: (step: string) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Conversion step:', step);
    posthog.capture('conversion_funnel_step', {
      step,
      timestamp: new Date().toISOString(),
    });
  },

  // Sample-relaterade events
  sampleClicked: () => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Sample clicked');
    posthog.capture('sample_clicked', {
      timestamp: new Date().toISOString(),
    });
  },

  sampleAnalyzed: (riskLevel: string) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Sample analyzed:', riskLevel);
    posthog.capture('sample_analyzed', {
      risk_level: riskLevel,
      timestamp: new Date().toISOString(),
    });
  },

  // Checkout/payment events
  checkoutStarted: () => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Checkout started');
    posthog.capture('checkout_started', {
      timestamp: new Date().toISOString(),
    });
  },

  paymentCompleted: () => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Payment completed');
    posthog.capture('payment_completed', {
      timestamp: new Date().toISOString(),
    });
  },

  // Analysis events
  analysisStarted: (isSample: boolean, contractLength: number) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Analysis started:', { isSample, contractLength });
    posthog.capture('analysis_started', {
      is_sample: isSample,
      contract_length: contractLength,
      timestamp: new Date().toISOString(),
    });
  },

  analysisCompleted: (
    isSample: boolean,
    riskLevel: string,
    timeMs: number
  ) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Analysis completed:', { isSample, riskLevel, timeMs });
    posthog.capture('analysis_completed', {
      is_sample: isSample,
      risk_level: riskLevel,
      analysis_time_ms: timeMs,
      timestamp: new Date().toISOString(),
    });
  },

  analysisFailed: (error: string, isSample: boolean) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Analysis failed:', { error, isSample });
    posthog.capture('analysis_failed', {
      error,
      is_sample: isSample,
      timestamp: new Date().toISOString(),
    });
  },

  // PDF export
  pdfDownloaded: (riskLevel: string) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 PDF downloaded:', riskLevel);
    posthog.capture('pdf_downloaded', {
      risk_level: riskLevel,
      timestamp: new Date().toISOString(),
    });
  },

  // User identification (after payment)
  identifyUser: (userId: string, properties?: Record<string, any>) => {
    if (!ensureInitialized()) return;
    
    console.log('📊 Identifying user:', userId);
    posthog.identify(userId, properties);
  },
};

// Export för att checka status (användbart för debugging)
export const isAnalyticsReady = () => isInitialized;