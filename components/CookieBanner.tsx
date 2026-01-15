import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Kolla om användaren redan har svarat
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    console.log('🍪 User accepted cookies');
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    
    // Dispatcha custom event så _app.tsx kan reagera
    window.dispatchEvent(new Event('cookieConsentChanged'));
  };

  const handleDecline = () => {
    console.log('🍪 User declined cookies');
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1e293b',
        color: 'white',
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
        zIndex: 9999,
        borderTop: '1px solid #334155'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap'
        }}
      >
        <p style={{ margin: 0, fontSize: 14, flex: 1, minWidth: 300 }}>
          We use cookies to analyze site usage and improve your experience. By continuing, you accept our use of analytics cookies.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid #475569',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: '#6366f1',
              color: 'white',
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