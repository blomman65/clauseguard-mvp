import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
    // PostHog will start tracking automatically since we check consent in _app.tsx
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.opt_in_capturing();
    }
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
    // Opt out of PostHog tracking
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.opt_out_capturing();
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1e293b',
        borderTop: '1px solid #334155',
        padding: '20px',
        zIndex: 9999,
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{ fontSize: 14, color: '#e2e8f0', margin: 0 }}>
            We use cookies to improve your experience and analyze site usage.{' '}
            <a
              href="/privacy"
              style={{ color: '#6366f1', textDecoration: 'underline' }}
            >
              Learn more
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={decline}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              cursor: 'pointer'
            }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              background: '#6366f1',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}