import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Kolla consent endast när komponenten är mounted
    if (typeof window !== 'undefined') {
      try {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
          setShowBanner(true);
        }
      } catch (e) {
        // Om localStorage inte funkar, visa inte banner
        console.warn('localStorage not available');
      }
    }
  }, []);

  const handleAccept = () => {
    console.log('🍪 User accepted cookies');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
        window.dispatchEvent(new Event('cookieConsentChanged'));
      } catch (e) {
        console.warn('Could not save cookie consent');
      }
    }
    setShowBanner(false);
  };

  const handleDecline = () => {
    console.log('🍪 User declined cookies');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', 'declined');
      } catch (e) {
        console.warn('Could not save cookie consent');
      }
    }
    setShowBanner(false);
  };

  // Visa inte banner förrän komponenten är mounted
  if (!mounted || !showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(15, 23, 42, 0.98)",
        backdropFilter: 'blur(12px)',
        color: "white",
        padding: '24px',
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        borderTop: '1px solid rgba(100, 116, 139, 0.3)'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap'
        }}
      >
        <p style={{ margin: 0, fontSize: 15, flex: 1, minWidth: 300, color: '#e2e8f0', lineHeight: 1.6 }}>
          We use cookies to analyze site usage and improve your experience. By continuing, you accept our use of analytics cookies.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              border: '1px solid rgba(148, 163, 184, 0.4)',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}