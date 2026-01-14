import posthog from 'posthog-js';

export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.init(
      process.env.NEXT_PUBLIC_POSTHOG_KEY!,
      {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        loaded: (posthogInstance) => {
          if (process.env.NODE_ENV === 'development') {
            posthogInstance.opt_out_capturing(); // Tracka inte i development
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
        page: pageName,
      });
    }
  },

  // Funnel / conversion tracking
  conversionFunnelStep: (step: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('conversion_funnel_step', {
        step,
      });
    }
  },

  // Sample-relaterade events
  sampleClicked: () => {
    if (typeof window !== 'undefined') {
      posthog.capture('sample_clicked');
    }
  },

  sampleAnalyzed: (riskLevel: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('sample_analyzed', {
        risk_level: riskLevel,
      });
    }
  },

  // Checkout/payment events
  checkoutStarted: () => {
    if (typeof window !== 'undefined') {
      posthog.capture('checkout_started');
    }
  },

  paymentCompleted: () => {
    if (typeof window !== 'undefined') {
      posthog.capture('payment_completed');
    }
  },

  // Analysis events
  analysisStarted: (isSample: boolean, contractLength: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('analysis_started', {
        is_sample: isSample,
        contract_length: contractLength,
      });
    }
  },

  analysisCompleted: (
    isSample: boolean,
    riskLevel: string,
    timeMs: number
  ) => {
    if (typeof window !== 'undefined') {
      posthog.capture('analysis_completed', {
        is_sample: isSample,
        risk_level: riskLevel,
        analysis_time_ms: timeMs,
      });
    }
  },

  analysisFailed: (error: string, isSample: boolean) => {
    if (typeof window !== 'undefined') {
      posthog.capture('analysis_failed', {
        error,
        is_sample: isSample,
      });
    }
  },

  // PDF export
  pdfDownloaded: (riskLevel: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('pdf_downloaded', {
        risk_level: riskLevel,
      });
    }
  },

  // User identification (after payment)
  identifyUser: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, properties);
    }
  },
};
