import posthog from 'posthog-js';

export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.init(
      process.env.NEXT_PUBLIC_POSTHOG_KEY!,
      {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing(); // Tracka inte i development
          }
        },
        capture_pageview: false, // Vi gör detta manuellt
        capture_pageleave: true,
        autocapture: false, // Vi väljer exakt vad vi vill tracka
      }
    );
  }
};

// Helper functions för att tracka events
export const analytics = {
  // Page views
  pageView: (pageName: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', {
        page: pageName
      });
    }
  },

  // Sample-relaterade events
  sampleClicked: () => {
    posthog.capture('sample_clicked');
  },

  sampleAnalyzed: (riskLevel: string) => {
    posthog.capture('sample_analyzed', {
      risk_level: riskLevel
    });
  },

  // Checkout/payment events
  checkoutStarted: () => {
    posthog.capture('checkout_started');
  },

  paymentCompleted: () => {
    posthog.capture('payment_completed');
  },

  // Analysis events
  analysisStarted: (isSample: boolean, contractLength: number) => {
    posthog.capture('analysis_started', {
      is_sample: isSample,
      contract_length: contractLength
    });
  },

  analysisCompleted: (isSample: boolean, riskLevel: string, timeMs: number) => {
    posthog.capture('analysis_completed', {
      is_sample: isSample,
      risk_level: riskLevel,
      analysis_time_ms: timeMs
    });
  },

  analysisFailed: (error: string, isSample: boolean) => {
    posthog.capture('analysis_failed', {
      error,
      is_sample: isSample
    });
  },

  // PDF export
  pdfDownloaded: (riskLevel: string) => {
    posthog.capture('pdf_downloaded', {
      risk_level: riskLevel
    });
  },

  // User identification (after payment)
  identifyUser: (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties);
  }
};