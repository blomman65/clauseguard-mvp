import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
          setShowBanner(true);
        }
      } catch (e) {
        console.warn('localStorage not available');
      }
    }
  }, []);

  const handleAcceptAll = () => {
    console.log('🍪 User accepted all cookies');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
        localStorage.setItem('cookie-analytics', 'true');
        window.dispatchEvent(new Event('cookieConsentChanged'));
      } catch (e) {
        console.warn('Could not save cookie consent');
      }
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleDeclineAll = () => {
    console.log('🍪 User declined all cookies');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', 'declined');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
        localStorage.setItem('cookie-analytics', 'false');
      } catch (e) {
        console.warn('Could not save cookie consent');
      }
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = (analytics: boolean) => {
    console.log('🍪 User saved preferences:', { analytics });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookie-consent', analytics ? 'accepted' : 'declined');
        localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
        localStorage.setItem('cookie-analytics', analytics ? 'true' : 'false');
        if (analytics) {
          window.dispatchEvent(new Event('cookieConsentChanged'));
        }
      } catch (e) {
        console.warn('Could not save cookie consent');
      }
    }
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!mounted || !showBanner) return null;

  if (showSettings) {
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
          padding: '32px 24px',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          borderTop: '1px solid rgba(100, 116, 139, 0.3)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: '#f8fafc' }}>
            Cookie Preferences
          </h2>
          
          <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 24, lineHeight: 1.6 }}>
            We use cookies to improve your experience. You can choose which cookies to accept.
          </p>

          <div style={{
            padding: 20,
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 12,
            marginBottom: 16,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Essential Cookies
              </h3>
              <span style={{
                padding: '4px 12px',
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#86efac',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700
              }}>
                Always Active
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Required for the website to function. These cookies remember your cookie preferences 
              and enable core functionality like payment processing.
            </p>
          </div>

          <div style={{
            padding: 20,
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 12,
            marginBottom: 24,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Analytics Cookies
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="analytics-toggle"
                  defaultChecked={false}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: '#6366f1'
                  }}
                />
                <span style={{ fontSize: 13, color: '#cbd5e1' }}>Enable</span>
              </label>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Help us understand how visitors use our website through anonymous data collection 
              (PostHog). No personal information is collected. All data is stored in EU servers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={handleDeclineAll}
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
              Decline All
            </button>
            
            <button
              onClick={() => {
                const analyticsCheckbox = document.getElementById('analytics-toggle') as HTMLInputElement;
                handleSavePreferences(analyticsCheckbox?.checked || false);
              }}
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
              Save Preferences
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#64748b', marginTop: 16, textAlign: 'center' }}>
            See our <a href="/privacy" style={{ color: '#818cf8', textDecoration: 'none' }}>Privacy Policy</a> for more details
          </p>
        </div>
      </div>
    );
  }

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
          We use cookies to analyze site usage and improve your experience. By clicking "Accept All", 
          you consent to our use of analytics cookies. You can customize your preferences or decline.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              border: '1px solid rgba(148, 163, 184, 0.4)',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
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
            Manage Preferences
          </button>
          
          <button
            onClick={handleDeclineAll}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 10,
              border: '1px solid rgba(148, 163, 184, 0.4)',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
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
            Decline All
          </button>
          
          <button
            onClick={handleAcceptAll}
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
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              whiteSpace: 'nowrap'
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
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}